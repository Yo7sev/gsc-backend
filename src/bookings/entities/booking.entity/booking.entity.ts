import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Match } from '../../../matches/entities/match.entity/match.entity';
import { Player } from '../../../players/entities/player.entity/player.entity';
import { Field } from '../../../fields/entities/field.entity/field.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, { eager: true, nullable: true })
  match: Match;

  @ManyToOne(() => Field, { eager: true, nullable: true })
  field: Field;

  // The team leader who made the booking
  @ManyToOne(() => Player, { eager: true })
  leader: Player;

  @Column()
  numberOfPlayers: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  bookedFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  bookedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
