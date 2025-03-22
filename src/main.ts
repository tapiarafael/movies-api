import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  const defaultLevel = process.env.NODE_ENV === 'production' ? 'debug' : 'log';
  const logLevel = (process.env.LOG_LEVEL || defaultLevel) as
    | 'log'
    | 'error'
    | 'warn'
    | 'debug'
    | 'verbose';

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', logLevel].filter(
      (l, i, arr) => arr.indexOf(l) === i,
    ) as LogLevel[],
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
