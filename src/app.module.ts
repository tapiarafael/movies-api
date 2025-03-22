import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [SeederModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
