import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { createReadStream } from 'fs';
import * as csv from 'csv-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from 'src/entities';
import { Repository } from 'typeorm';

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

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Producer)
    private readonly producerRepository: Repository<Producer>,
    @InjectRepository(Studio)
    private readonly studioRepository: Repository<Studio>,
  ) {}

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

    const movie = this.movieRepository.create({
      releaseYear: year,
      title,
      winner,
      studios: studioRecords,
      producers: producerRecords,
    });

    await this.movieRepository.save(movie);

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
      producers.map(async (name) => {
        const producerExists = await this.producerRepository.findOne({
          where: { name },
        });

        if (producerExists) {
          return producerExists;
        }

        const createdProducer = this.producerRepository.create({ name });
        return this.producerRepository.save(createdProducer);
      }),
    );
  }

  private async insertStudios(studios: string[]) {
    return Promise.all(
      studios.map(async (name) => {
        const studioExists = await this.studioRepository.findOne({
          where: { name },
        });

        if (studioExists) {
          return studioExists;
        }

        const createdStudio = this.studioRepository.create({ name });
        return this.studioRepository.save(createdStudio);
      }),
    );
  }
}
