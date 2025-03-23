import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/entities';
import { Repository } from 'typeorm';

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

@Injectable()
export class AwardsService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async calculateProducerAwardsInterval() {
    const winnerMovies = await this.movieRepository.find({
      where: {
        winner: true,
      },
      order: {
        releaseYear: 'ASC',
      },
      select: {
        releaseYear: true,
        producers: {
          name: true,
        },
      },
      relations: ['producers'],
    });

    const producerMap = new Map<string, number[]>();
    winnerMovies.forEach((movie) => {
      movie.producers.forEach(({ name }) => {
        const list = producerMap.get(name) || [];
        list.push(movie.releaseYear);
        producerMap.set(name, list);
      });
    });

    const intervals: Array<ProducerInterval> = [];

    for (const [producer, years] of producerMap) {
      if (years.length < 2) {
        continue;
      }

      years.forEach((year, index) => {
        if (index === years.length - 1) {
          return;
        }

        const interval = years[index + 1] - year;
        intervals.push({
          producer,
          interval,
          previousWin: year,
          followingWin: years[index + 1],
        });
      });
    }

    const maxInterval = Math.max(
      ...intervals.map((interval) => interval.interval),
    );
    const minInterval = Math.min(
      ...intervals.map((interval) => interval.interval),
    );

    const maxIntervalProducers = intervals.filter(
      (interval) => interval.interval === maxInterval,
    );
    const minIntervalProducers = intervals.filter(
      (interval) => interval.interval === minInterval,
    );

    return {
      min: minIntervalProducers,
      max: maxIntervalProducers,
    };
  }
}
