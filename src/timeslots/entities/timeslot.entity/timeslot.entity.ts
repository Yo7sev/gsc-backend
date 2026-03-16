import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Field } from '../../../fields/entities/field.entity/field.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
}

@Entity()
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Field, { eager: true })
  field: Field;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @Column({ type: 'int', nullable: true })
  bookedByLeaderId: number | null;

  @Column({ type: 'varchar', nullable: true })
  bookedByLeaderName: string | null;

  @Column({ type: 'int', nullable: true })
  numberOfPlayers: number | null;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
