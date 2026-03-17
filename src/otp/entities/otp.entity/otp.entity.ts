import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum OtpType {
  PLAYER = 'player',
  FIELD_MANAGER = 'field_manager',
}

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type: OtpType;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
