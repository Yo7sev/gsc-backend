import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { Field, JordanCity } from './entities/field.entity/field.entity';
import { FieldRating } from './entities/field-rating.entity/field-rating.entity';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  // Owner registers his field
  @Post()
  create(@Body() fieldData: Partial<Field>): Promise<Field> {
    return this.fieldsService.create(fieldData);
  }

  // Get all fields
  @Get()
  findAll(): Promise<Field[]> {
    return this.fieldsService.findAll();
  }

  // Get all fields for map
  @Get('map')
  getMapFields(): Promise<object[]> {
    return this.fieldsService.getMapFields();
  }

  // Get fields by city
  @Get('city/:city')
  findByCity(@Param('city') city: JordanCity): Promise<Field[]> {
    return this.fieldsService.findByCity(city);
  }

  // Get field status
  @Get(':id/status')
  getFieldStatus(@Param('id') id: number): Promise<object> {
    return this.fieldsService.getFieldStatus(id);
  }

  // Get field ratings
  @Get(':id/ratings')
  getFieldRatings(@Param('id') id: number): Promise<FieldRating[]> {
    return this.fieldsService.getFieldRatings(id);
  }

  // Get one field
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Field | null> {
    return this.fieldsService.findOne(id);
  }

  // Owner updates field details
  @Patch(':id')
  updateDetails(
    @Param('id') id: number,
    @Body() data: Partial<Field>,
  ): Promise<Field> {
    return this.fieldsService.updateDetails(id, data);
  }

  // Set field as booked
  @Patch(':id/book')
  setBooked(
    @Param('id') id: number,
    @Body('bookedFrom') bookedFrom: Date,
    @Body('bookedUntil') bookedUntil: Date,
  ): Promise<Field> {
    return this.fieldsService.setBooked(id, bookedFrom, bookedUntil);
  }

  // Set field as free
  @Patch(':id/free')
  setFree(@Param('id') id: number): Promise<Field> {
    return this.fieldsService.setFree(id);
  }

  // Set field under maintenance
  @Patch(':id/maintenance')
  setMaintenance(@Param('id') id: number): Promise<Field> {
    return this.fieldsService.setMaintenance(id);
  }

  // Player rates a field
  @Post(':id/rate')
  rateField(
    @Param('id') id: number,
    @Body('playerId') playerId: number,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ): Promise<FieldRating> {
    return this.fieldsService.rateField(id, playerId, rating, comment);
  }
}
