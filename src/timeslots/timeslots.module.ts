import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlotsController } from './timeslots.controller';
import { TimeSlotsService } from './timeslots.service';
import { TimeSlot } from './entities/timeslot.entity/timeslot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlot])],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
