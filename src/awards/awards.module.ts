import { Module } from '@nestjs/common';
import { AwardsController } from './awards.controller';
import { AwardsService } from './awards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/entities';

@Module({
  controllers: [AwardsController],
  providers: [AwardsService],
  imports: [TypeOrmModule.forFeature([Movie])],
})
export class AwardsModule {}
