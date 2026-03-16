import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { Field } from './entities/field.entity/field.entity';
import { FieldRating } from './entities/field-rating.entity/field-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Field, FieldRating])],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
