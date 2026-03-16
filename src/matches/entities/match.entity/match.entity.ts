import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum MatchStatus {
  UPCOMING = 'upcoming',
  FULL = 'full',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pitch: string;

  @Column()
  matchDate: Date;

  @Column()
  matchTime: string;

  @Column()
  price: number;

  @Column({ default: 14 })
  maxCapacity: number;

  @Column({ default: 0 })
  currentPlayers: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.UPCOMING,
  })
  status: MatchStatus;

  @Column({ nullable: true })
  organizer: string;

  @Column({ nullable: true })
  referee: string;

  @Column({ nullable: true })
  photographer: string;

  @CreateDateColumn()
  createdAt: Date;
}
