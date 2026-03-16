import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Booking,
  BookingStatus,
} from './entities/booking.entity/booking.entity';
import {
  Field,
  FieldStatus,
} from '../fields/entities/field.entity/field.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Field)
    private fieldsRepository: Repository<Field>,
  ) {}

  async bookField(
    leaderId: number,
    fieldId: number,
    numberOfPlayers: number,
    bookedFrom: Date,
    bookedUntil: Date,
    notes?: string,
  ): Promise<Booking> {
    // Check player limit
    if (numberOfPlayers > 22) {
      throw new BadRequestException('Maximum number of players allowed is 22');
    }

    // Check field exists
    const field = await this.fieldsRepository.findOneBy({ id: fieldId });
    if (!field) throw new NotFoundException('Field not found');

    // Check if field is already booked
    if (field.status === FieldStatus.BOOKED) {
      throw new BadRequestException(
        'This field is already booked for this period',
      );
    }

    // Check if field is under maintenance
    if (field.status === FieldStatus.MAINTENANCE) {
      throw new BadRequestException('This field is under maintenance');
    }

    // Check if leader already has an active booking
    const existingBooking = await this.bookingsRepository.findOne({
      where: {
        leader: { id: leaderId },
        status: BookingStatus.CONFIRMED,
      },
    });
    if (existingBooking) {
      throw new BadRequestException(
        'You already have an active booking. Cancel it first.',
      );
    }

    // Create booking as PENDING — waiting for field owner approval
    const booking = this.bookingsRepository.create({
      field: { id: fieldId },
      leader: { id: leaderId },
      numberOfPlayers,
      bookedFrom,
      bookedUntil,
      notes,
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  // Field owner approves booking
  async approveBooking(bookingId: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['field', 'leader'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Booking is not pending');

    booking.status = BookingStatus.CONFIRMED;
    await this.bookingsRepository.save(booking);

    // Mark field as booked
    const field = await this.fieldsRepository.findOneBy({
      id: booking.field.id,
    });
    if (field) {
      field.status = FieldStatus.BOOKED;
      field.bookedFrom = booking.bookedFrom;
      field.bookedUntil = booking.bookedUntil;
      await this.fieldsRepository.save(field);
    }

    return booking;
  }

  // Field owner rejects booking
  async rejectBooking(bookingId: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['field', 'leader'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Booking is not pending');

    booking.status = BookingStatus.REJECTED;
    await this.bookingsRepository.save(booking);

    return booking;
  }

  // Leader cancels booking
  async cancelBooking(bookingId: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['field', 'leader'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);

    // Free up the field
    if (booking.field) {
      const field = await this.fieldsRepository.findOneBy({
        id: booking.field.id,
      });
      if (field) {
        field.status = FieldStatus.FREE;
        field.bookedFrom = null;
        field.bookedUntil = null;
        await this.fieldsRepository.save(field);
      }
    }

    // Check waitlist
    if (booking.field) {
      const nextInLine = await this.bookingsRepository.findOne({
        where: {
          field: { id: booking.field.id },
          status: BookingStatus.WAITLISTED,
        },
        order: { createdAt: 'ASC' },
      });

      if (nextInLine) {
        nextInLine.status = BookingStatus.PENDING;
        await this.bookingsRepository.save(nextInLine);
      }
    }

    return booking;
  }

  async joinWaitlist(
    leaderId: number,
    fieldId: number,
    numberOfPlayers: number,
    bookedFrom: Date,
    bookedUntil: Date,
    notes?: string,
  ): Promise<Booking> {
    if (numberOfPlayers > 22) {
      throw new BadRequestException('Maximum number of players allowed is 22');
    }

    const field = await this.fieldsRepository.findOneBy({ id: fieldId });
    if (!field) throw new NotFoundException('Field not found');

    const booking = this.bookingsRepository.create({
      field: { id: fieldId },
      leader: { id: leaderId },
      numberOfPlayers,
      bookedFrom,
      bookedUntil,
      notes,
      status: BookingStatus.WAITLISTED,
    });

    return this.bookingsRepository.save(booking);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['field', 'leader'],
    });
  }

  async getFieldBookings(fieldId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { field: { id: fieldId } },
      relations: ['leader'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingBookings(fieldId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        field: { id: fieldId },
        status: BookingStatus.PENDING,
      },
      relations: ['leader'],
      order: { createdAt: 'ASC' },
    });
  }

  async getWaitlist(fieldId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        field: { id: fieldId },
        status: BookingStatus.WAITLISTED,
      },
      order: { createdAt: 'ASC' },
      relations: ['leader'],
    });
  }
}
