import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TimeSlotsService } from './timeslots.service';
import { TimeSlot } from './entities/timeslot.entity/timeslot.entity';

@Controller('timeslots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  // Field Manager creates one slot
  @Post()
  createSlot(
    @Body('fieldId') fieldId: number,
    @Body('date') date: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ): Promise<TimeSlot> {
    return this.timeSlotsService.createSlot(fieldId, date, startTime, endTime);
  }

  // Field Manager creates multiple slots at once
  @Post('bulk')
  createMultipleSlots(
    @Body('fieldId') fieldId: number,
    @Body('date') date: string,
    @Body('slots') slots: { startTime: string; endTime: string }[],
  ): Promise<TimeSlot[]> {
    return this.timeSlotsService.createMultipleSlots(fieldId, date, slots);
  }

  // Field Manager sees ALL slots for his field
  @Get('field/:fieldId')
  getFieldSlots(@Param('fieldId') fieldId: number): Promise<TimeSlot[]> {
    return this.timeSlotsService.getFieldSlots(fieldId);
  }

  // Team Leader sees ONLY AVAILABLE slots
  @Get('field/:fieldId/available')
  getAvailableSlots(
    @Param('fieldId') fieldId: number,
    @Query('date') date?: string,
  ): Promise<TimeSlot[]> {
    return this.timeSlotsService.getAvailableSlots(fieldId, date);
  }

  // Field Manager sees booked slots
  @Get('field/:fieldId/booked')
  getBookedSlots(@Param('fieldId') fieldId: number): Promise<TimeSlot[]> {
    return this.timeSlotsService.getBookedSlots(fieldId);
  }

  // Team Leader books a slot
  @Patch(':id/book')
  bookSlot(
    @Param('id') id: number,
    @Body('leaderId') leaderId: number,
    @Body('leaderName') leaderName: string,
    @Body('numberOfPlayers') numberOfPlayers: number,
    @Body('notes') notes?: string,
  ): Promise<TimeSlot> {
    return this.timeSlotsService.bookSlot(
      id,
      leaderId,
      leaderName,
      numberOfPlayers,
      notes,
    );
  }

  // Field Manager frees a slot back to available
  @Patch(':id/free')
  freeSlot(@Param('id') id: number): Promise<TimeSlot> {
    return this.timeSlotsService.freeSlot(id);
  }

  // Field Manager cancels a slot
  @Patch(':id/cancel')
  cancelSlot(@Param('id') id: number): Promise<TimeSlot> {
    return this.timeSlotsService.cancelSlot(id);
  }

  // Field Manager deletes a slot
  @Delete(':id')
  deleteSlot(@Param('id') id: number): Promise<void> {
    return this.timeSlotsService.deleteSlot(id);
  }
}
