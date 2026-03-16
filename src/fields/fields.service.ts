import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Field,
  FieldStatus,
  JordanCity,
} from './entities/field.entity/field.entity';
import { FieldRating } from './entities/field-rating.entity/field-rating.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private fieldsRepository: Repository<Field>,
    @InjectRepository(FieldRating)
    private ratingsRepository: Repository<FieldRating>,
  ) {}

  async create(fieldData: Partial<Field>): Promise<Field> {
    const field = this.fieldsRepository.create(fieldData);
    return this.fieldsRepository.save(field);
  }

  async findAll(): Promise<Field[]> {
    return this.fieldsRepository.find();
  }

  async findByCity(city: JordanCity): Promise<Field[]> {
    return this.fieldsRepository.find({ where: { city } });
  }

  async findOne(id: number): Promise<Field | null> {
    return this.fieldsRepository.findOneBy({ id });
  }

  async getFieldStatus(id: number): Promise<object> {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) throw new NotFoundException('Field not found');

    return {
      fieldName: field.name,
      city: field.city,
      status: field.status,
      bookedFrom: field.bookedFrom,
      bookedUntil: field.bookedUntil,
      openingTime: field.openingTime,
      closingTime: field.closingTime,
      pricePerHour: field.pricePerHour,
      averageRating: field.averageRating,
      totalRatings: field.totalRatings,
    };
  }

  async setBooked(
    id: number,
    bookedFrom: Date,
    bookedUntil: Date,
  ): Promise<Field> {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) throw new NotFoundException('Field not found');

    field.status = FieldStatus.BOOKED;
    field.bookedFrom = bookedFrom;
    field.bookedUntil = bookedUntil;
    return this.fieldsRepository.save(field);
  }

  async setFree(id: number): Promise<Field> {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) throw new NotFoundException('Field not found');

    field.status = FieldStatus.FREE;
    field.bookedFrom = null;
    field.bookedUntil = null;
    return this.fieldsRepository.save(field);
  }

  async setMaintenance(id: number): Promise<Field> {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) throw new NotFoundException('Field not found');

    field.status = FieldStatus.MAINTENANCE;
    field.bookedFrom = null;
    field.bookedUntil = null;
    return this.fieldsRepository.save(field);
  }

  async updateDetails(id: number, data: Partial<Field>): Promise<Field> {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) throw new NotFoundException('Field not found');

    Object.assign(field, data);
    return this.fieldsRepository.save(field);
  }

  async getMapFields(): Promise<object[]> {
    const fields = await this.fieldsRepository.find();
    return fields.map((field) => ({
      id: field.id,
      name: field.name,
      city: field.city,
      address: field.address,
      status: field.status,
      latitude: field.latitude,
      longitude: field.longitude,
      pricePerHour: field.pricePerHour,
      averageRating: field.averageRating,
    }));
  }

  async rateField(
    fieldId: number,
    playerId: number,
    rating: number,
    comment?: string,
  ): Promise<FieldRating> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const field = await this.fieldsRepository.findOneBy({ id: fieldId });
    if (!field) throw new NotFoundException('Field not found');

    // Check if player already rated this field
    const existingRating = await this.ratingsRepository.findOne({
      where: {
        field: { id: fieldId },
        player: { id: playerId },
      },
    });
    if (existingRating) {
      throw new BadRequestException('You have already rated this field');
    }

    const newRating = this.ratingsRepository.create({
      field: { id: fieldId },
      player: { id: playerId },
      rating,
      comment,
    });
    await this.ratingsRepository.save(newRating);

    // Update average rating
    const allRatings = await this.ratingsRepository.find({
      where: { field: { id: fieldId } },
    });
    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    field.averageRating = total / allRatings.length;
    field.totalRatings = allRatings.length;
    await this.fieldsRepository.save(field);

    return newRating;
  }

  async getFieldRatings(fieldId: number): Promise<FieldRating[]> {
    return this.ratingsRepository.find({
      where: { field: { id: fieldId } },
      relations: ['player'],
      order: { createdAt: 'DESC' },
    });
  }
}
