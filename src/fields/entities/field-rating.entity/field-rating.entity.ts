import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Field } from '../field.entity/field.entity';
import { Player } from '../../../players/entities/player.entity/player.entity';

@Entity()
export class FieldRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Field, { eager: true })
  field: Field;

  @ManyToOne(() => Player, { eager: true })
  player: Player;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
