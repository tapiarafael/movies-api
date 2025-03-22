import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NDOE_ENV === 'test' ? '.env.test' : '.env',
    }),
    SeederModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
