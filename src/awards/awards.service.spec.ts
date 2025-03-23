import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from 'src/entities';
import { Repository } from 'typeorm';
import { AwardsService } from './awards.service';

describe('calculateProducerAwardsInterval', () => {
  let service: AwardsService;
  let movieRepo: Repository<Movie>;
  let producerRepo: Repository<Producer>;
  let studioRepo: Repository<Studio>;
  let studio: Studio;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [Movie, Producer, Studio],
        }),
        TypeOrmModule.forFeature([Movie, Producer, Studio]),
      ],
      providers: [AwardsService],
    }).compile();

    service = module.get<AwardsService>(AwardsService);
    movieRepo = module.get(getRepositoryToken(Movie));
    producerRepo = module.get(getRepositoryToken(Producer));
    studioRepo = module.get(getRepositoryToken(Studio));

    studio = await studioRepo.save({ name: 'Studio' });
  });

  afterEach(async () => {
    await movieRepo.clear();
    await producerRepo.clear();
    await studioRepo.clear();
  });

  it('should return empty min/max when there are no winning movies', async () => {
    const result = await service.calculateProducerAwardsInterval();
    expect(result.min).toEqual([]);
    expect(result.max).toEqual([]);
  });

  it('should ignore producers with only one winning movie', async () => {
    const [producer] = await producerRepo.save([{ name: 'Solo Producer' }]);

    await movieRepo.save({
      title: 'Only Win',
      releaseYear: 2020,
      winner: true,
      producers: [producer],
      studios: [studio],
    });

    const result = await service.calculateProducerAwardsInterval();
    expect(result.min).toEqual([]);
    expect(result.max).toEqual([]);
  });

  it('should return correct min interval', async () => {
    const [producer] = await producerRepo.save([{ name: 'Producer A' }]);

    await movieRepo.save([
      {
        title: 'Win 1',
        releaseYear: 2000,
        winner: true,
        producers: [producer],
        studios: [studio],
      },
      {
        title: 'Win 2',
        releaseYear: 2001,
        winner: true,
        producers: [producer],
        studios: [studio],
      },
    ]);

    const result = await service.calculateProducerAwardsInterval();
    expect(result.min).toEqual([
      {
        producer: 'Producer A',
        interval: 1,
        previousWin: 2000,
        followingWin: 2001,
      },
    ]);
  });

  it('should return correct max interval', async () => {
    const [producer] = await producerRepo.save([{ name: 'Producer B' }]);

    await movieRepo.save([
      {
        title: 'Win 1',
        releaseYear: 1990,
        winner: true,
        producers: [producer],
        studios: [studio],
      },
      {
        title: 'Win 2',
        releaseYear: 2010,
        winner: true,
        producers: [producer],
        studios: [studio],
      },
    ]);

    const result = await service.calculateProducerAwardsInterval();
    expect(result.max).toEqual([
      {
        producer: 'Producer B',
        interval: 20,
        previousWin: 1990,
        followingWin: 2010,
      },
    ]);
  });

  it('should return multiple producers with same min interval', async () => {
    const [a, b] = await producerRepo.save([{ name: 'A' }, { name: 'B' }]);

    await movieRepo.save([
      {
        title: 'A1',
        releaseYear: 2000,
        winner: true,
        producers: [a],
        studios: [studio],
      },
      {
        title: 'A2',
        releaseYear: 2001,
        winner: true,
        producers: [a],
        studios: [studio],
      },
      {
        title: 'B1',
        releaseYear: 2010,
        winner: true,
        producers: [b],
        studios: [studio],
      },
      {
        title: 'B2',
        releaseYear: 2011,
        winner: true,
        producers: [b],
        studios: [studio],
      },
    ]);

    const result = await service.calculateProducerAwardsInterval();
    expect(result.min).toEqual(
      expect.arrayContaining([
        { producer: 'A', interval: 1, previousWin: 2000, followingWin: 2001 },
        { producer: 'B', interval: 1, previousWin: 2010, followingWin: 2011 },
      ]),
    );
  });
});
