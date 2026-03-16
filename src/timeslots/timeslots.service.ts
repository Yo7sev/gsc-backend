import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TimeSlot,
  SlotStatus,
} from './entities/timeslot.entity/timeslot.entity';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private timeSlotsRepository: Repository<TimeSlot>,
  ) {}

  // Field Manager creates available time slots
  async createSlot(
    fieldId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<TimeSlot> {
    // Check if slot already exists for this field/date/time
    const existing = await this.timeSlotsRepository.findOne({
      where: {
        field: { id: fieldId },
        date,
        startTime,
        status: SlotStatus.AVAILABLE,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This time slot already exists for this field',
      );
    }

    const slot = this.timeSlotsRepository.create({
      field: { id: fieldId },
      date,
      startTime,
      endTime,
      status: SlotStatus.AVAILABLE,
    });
    return this.timeSlotsRepository.save(slot);
  }

  // Create multiple slots at once
  async createMultipleSlots(
    fieldId: number,
    date: string,
    slots: { startTime: string; endTime: string }[],
  ): Promise<TimeSlot[]> {
    const created: TimeSlot[] = [];
    for (const slot of slots) {
      const newSlot = this.timeSlotsRepository.create({
        field: { id: fieldId },
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: SlotStatus.AVAILABLE,
      });
      created.push(await this.timeSlotsRepository.save(newSlot));
    }
    return created;
  }

  // Get ALL slots for a field (for Field Manager)
  async getFieldSlots(fieldId: number): Promise<TimeSlot[]> {
    return this.timeSlotsRepository.find({
      where: { field: { id: fieldId } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  // Get ONLY AVAILABLE slots for a field (for Team Leaders)
  async getAvailableSlots(fieldId: number, date?: string): Promise<TimeSlot[]> {
    const where: {
      field: { id: number };
      status: SlotStatus;
      date?: string;
    } = {
      field: { id: fieldId },
      status: SlotStatus.AVAILABLE,
    };
    if (date) where.date = date;

    return this.timeSlotsRepository.find({
      where,
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  // Team Leader books a slot — immediately hidden from available list
  async bookSlot(
    slotId: number,
    leaderId: number,
    leaderName: string,
    numberOfPlayers: number,
    notes?: string,
  ): Promise<TimeSlot> {
    if (numberOfPlayers > 22) {
      throw new BadRequestException('Maximum 22 players allowed');
    }

    const slot = await this.timeSlotsRepository.findOne({
      where: { id: slotId },
      relations: ['field'],
    });
    if (!slot) throw new NotFoundException('Time slot not found');
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException('This slot is no longer available');
    }

    // Immediately mark as booked — disappears from available list
    slot.status = SlotStatus.BOOKED;
    slot.bookedByLeaderId = leaderId;
    slot.bookedByLeaderName = leaderName;
    slot.numberOfPlayers = numberOfPlayers;
    slot.notes = notes || null;

    return this.timeSlotsRepository.save(slot);
  }

  // Field Manager cancels a slot
  async cancelSlot(slotId: number): Promise<TimeSlot> {
    const slot = await this.timeSlotsRepository.findOne({
      where: { id: slotId },
      relations: ['field'],
    });
    if (!slot) throw new NotFoundException('Time slot not found');

    slot.status = SlotStatus.CANCELLED;
    slot.bookedByLeaderId = null;
    slot.bookedByLeaderName = null;
    slot.numberOfPlayers = null;
    slot.notes = null;
    return this.timeSlotsRepository.save(slot);
  }

  // Field Manager frees a booked slot back to available
  async freeSlot(slotId: number): Promise<TimeSlot> {
    const slot = await this.timeSlotsRepository.findOne({
      where: { id: slotId },
      relations: ['field'],
    });
    if (!slot) throw new NotFoundException('Time slot not found');

    slot.status = SlotStatus.AVAILABLE;
    slot.bookedByLeaderId = null;
    slot.bookedByLeaderName = null;
    slot.numberOfPlayers = null;
    slot.notes = null;
    return this.timeSlotsRepository.save(slot);
  }

  // Get booked slots for a field (Field Manager view)
  async getBookedSlots(fieldId: number): Promise<TimeSlot[]> {
    return this.timeSlotsRepository.find({
      where: {
        field: { id: fieldId },
        status: SlotStatus.BOOKED,
      },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  // Delete a slot (Field Manager)
  async deleteSlot(slotId: number): Promise<void> {
    const slot = await this.timeSlotsRepository.findOneBy({ id: slotId });
    if (!slot) throw new NotFoundException('Time slot not found');
    await this.timeSlotsRepository.delete(slotId);
  }
}
