import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum FieldStatus {
  FREE = 'free',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
}

export enum JordanCity {
  AMMAN = 'Amman',
  ZARQA = 'Zarqa',
  IRBID = 'Irbid',
  AQABA = 'Aqaba',
  SALT = 'Salt',
  MADABA = 'Madaba',
  JERASH = 'Jerash',
  AJLOUN = 'Ajloun',
  KARAK = 'Karak',
  TAFILAH = 'Tafilah',
  MAAN = 'Maan',
  MAFRAQ = 'Mafraq',
}

@Entity()
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: JordanCity,
  })
  city: JordanCity;

  @Column()
  address: string;

  @Column()
  ownerName: string;

  @Column({ unique: true })
  ownerPhone: string;

  @Column({
    type: 'enum',
    enum: FieldStatus,
    default: FieldStatus.FREE,
  })
  status: FieldStatus;

  @Column({ type: 'timestamp', nullable: true })
  bookedFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  bookedUntil: Date | null;

  @Column({ nullable: true })
  ownerAdminId: number;

  // Price per hour
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerHour: number;

  // Opening & closing hours
  @Column({ default: '08:00' })
  openingTime: string;

  @Column({ default: '23:00' })
  closingTime: string;

  // Map coordinates
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  // Ratings
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalRatings: number;

  @CreateDateColumn()
  createdAt: Date;
}
