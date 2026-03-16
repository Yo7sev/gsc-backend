import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { AdminsModule } from './admins/admins.module';
import { MatchesModule } from './matches/matches.module';
import { BookingsModule } from './bookings/bookings.module';
import { FieldsModule } from './fields/fields.module';
import { TimeSlotsModule } from './timeslots/timeslots.module';
import { Player } from './players/entities/player.entity/player.entity';
import { Admin } from './admins/entities/admin.entity/admin.entity';
import { Match } from './matches/entities/match.entity/match.entity';
import { Booking } from './bookings/entities/booking.entity/booking.entity';
import { Field } from './fields/entities/field.entity/field.entity';
import { FieldRating } from './fields/entities/field-rating.entity/field-rating.entity';
import { TimeSlot } from './timeslots/entities/timeslot.entity/timeslot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Player, Admin, Match, Booking, Field, FieldRating, TimeSlot],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PlayersModule,
    AdminsModule,
    MatchesModule,
    BookingsModule,
    FieldsModule,
    TimeSlotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
