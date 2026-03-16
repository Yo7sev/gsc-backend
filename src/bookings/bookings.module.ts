import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity/booking.entity';
import { Field } from '../fields/entities/field.entity/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Field])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
