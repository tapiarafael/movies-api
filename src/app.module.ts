import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from './entities';
import { AwardsModule } from './awards/awards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Movie, Studio, Producer],
      synchronize: true,
    }),
    SeederModule,
    AwardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
