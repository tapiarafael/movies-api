import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import { createReadStream } from 'fs';
import * as csv from 'csv-parser';

interface MovieCsvRow {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner: string;
}

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      process.env.DATASET || 'movielist.csv',
    );
    this.logger.log('Starting seeding from file ' + filePath);
    const startTime = Date.now();

    const stream = createReadStream(filePath).pipe(csv({ separator: ';' }));

    let count = 0;
    for await (const row of stream) {
      await this.handleRow(row);
      count++;
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    this.logger.log(
      `Seeding completed. Total movies inserted: ${count} in ${durationMs}ms`,
    );
  }

  private async handleRow(row: MovieCsvRow) {
    const { producers, studios, title, winner, year } = this.parseData(row);

    const studioRecords = await this.insertStudios(studios);

    const producerRecords = await this.insertProducers(producers);

    await this.prismaService.movie.create({
      data: {
        releaseYear: year,
        title,
        winner,
        studios: {
          connect: studioRecords.map((s) => ({ id: s.id })),
        },
        producers: {
          connect: producerRecords.map((p) => ({ id: p.id })),
        },
      },
    });
    this.logger.debug(`Inserted movie: "${title}" (${year})`);
  }

  private parseData(data: MovieCsvRow) {
    const year = parseInt(data.year);
    const title = data.title;
    const studios = data.studios
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const producers = data.producers
      .split(/,| and /)
      .map((p) => p.trim())
      .filter(Boolean);
    const winner = data.winner?.toLowerCase() === 'yes';
    return { year, title, studios, producers, winner };
  }

  private async insertProducers(producers: string[]) {
    return Promise.all(
      producers.map((producer) =>
        this.prismaService.producer.upsert({
          where: { name: producer },
          update: {},
          create: { name: producer },
        }),
      ),
    );
  }

  private async insertStudios(studios: string[]) {
    return Promise.all(
      studios.map((studio) =>
        this.prismaService.studio.upsert({
          where: { name: studio },
          update: {},
          create: { name: studio },
        }),
      ),
    );
  }
}
