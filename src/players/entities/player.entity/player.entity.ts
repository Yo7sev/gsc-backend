import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  primaryPosition: string;

  @Column({ nullable: true })
  secondaryPosition: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 0 })
  level: number;

  @CreateDateColumn()
  createdAt: Date;
}
