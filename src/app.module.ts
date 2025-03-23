import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NDOE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Movie, Studio, Producer],
      synchronize: true,
    }),
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
