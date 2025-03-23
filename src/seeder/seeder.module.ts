import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from 'src/entities';

@Module({
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([Movie, Producer, Studio])],
})
export class SeederModule {}
