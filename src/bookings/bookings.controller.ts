import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity/booking.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Leader books a field
  @Post()
  bookField(
    @Body('leaderId') leaderId: number,
    @Body('fieldId') fieldId: number,
    @Body('numberOfPlayers') numberOfPlayers: number,
    @Body('bookedFrom') bookedFrom: Date,
    @Body('bookedUntil') bookedUntil: Date,
    @Body('notes') notes?: string,
  ): Promise<Booking> {
    return this.bookingsService.bookField(
      leaderId,
      fieldId,
      numberOfPlayers,
      bookedFrom,
      bookedUntil,
      notes,
    );
  }

  // Leader joins waitlist
  @Post('waitlist')
  joinWaitlist(
    @Body('leaderId') leaderId: number,
    @Body('fieldId') fieldId: number,
    @Body('numberOfPlayers') numberOfPlayers: number,
    @Body('bookedFrom') bookedFrom: Date,
    @Body('bookedUntil') bookedUntil: Date,
    @Body('notes') notes?: string,
  ): Promise<Booking> {
    return this.bookingsService.joinWaitlist(
      leaderId,
      fieldId,
      numberOfPlayers,
      bookedFrom,
      bookedUntil,
      notes,
    );
  }

  // Field owner approves booking
  @Patch(':id/approve')
  approveBooking(@Param('id') id: number): Promise<Booking> {
    return this.bookingsService.approveBooking(id);
  }

  // Field owner rejects booking
  @Patch(':id/reject')
  rejectBooking(@Param('id') id: number): Promise<Booking> {
    return this.bookingsService.rejectBooking(id);
  }

  // Leader cancels booking
  @Patch(':id/cancel')
  cancelBooking(@Param('id') id: number): Promise<Booking> {
    return this.bookingsService.cancelBooking(id);
  }

  // Get all bookings
  @Get()
  getAllBookings(): Promise<Booking[]> {
    return this.bookingsService.getAllBookings();
  }

  // Get all bookings for a field
  @Get('field/:fieldId')
  getFieldBookings(@Param('fieldId') fieldId: number): Promise<Booking[]> {
    return this.bookingsService.getFieldBookings(fieldId);
  }

  // Get pending bookings for a field
  @Get('field/:fieldId/pending')
  getPendingBookings(@Param('fieldId') fieldId: number): Promise<Booking[]> {
    return this.bookingsService.getPendingBookings(fieldId);
  }

  // Get waitlist for a field
  @Get('field/:fieldId/waitlist')
  getWaitlist(@Param('fieldId') fieldId: number): Promise<Booking[]> {
    return this.bookingsService.getWaitlist(fieldId);
  }
}
