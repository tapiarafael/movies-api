import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { Movie, Producer, Studio } from 'src/entities';

describe('SeederService (integration)', () => {
  let seederService: SeederService;
  let movieRepo: Repository<Movie>;
  let producerRepo: Repository<Producer>;
  let studioRepo: Repository<Studio>;

  const testCsvPath = join(__dirname, 'test-movielist.csv');

  const mockCsvContent = `year;title;studios;producers;winner
          1980;Test Movie;Test Studio;Test Producer;yes`;

  beforeAll(() => {
    writeFileSync(testCsvPath, mockCsvContent);
    process.env.DATASET = `src/seeder/test-movielist.csv`;
  });

  afterAll(() => {
    if (existsSync(testCsvPath)) {
      unlinkSync(testCsvPath);
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Movie, Producer, Studio],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Movie, Producer, Studio]),
      ],
      providers: [SeederService],
    }).compile();

    seederService = module.get<SeederService>(SeederService);
    movieRepo = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    producerRepo = module.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    studioRepo = module.get<Repository<Studio>>(getRepositoryToken(Studio));
  });

  afterEach(async () => {
    await movieRepo.clear();
    await producerRepo.clear();
    await studioRepo.clear();
  });

  it('should be defined', () => {
    expect(seederService).toBeDefined();
  });

  it('should seed data from CSV into the database', async () => {
    await seederService.onModuleInit();

    const movies = await movieRepo.find({
      relations: ['studios', 'producers'],
    });

    expect(movies).toHaveLength(1);
    const movie = movies[0];
    expect(movie.title).toBe('Test Movie');
    expect(movie.releaseYear).toBe(1980);
    expect(movie.winner).toBe(true);
    expect(movie.studios).toHaveLength(1);
    expect(movie.studios[0].name).toBe('Test Studio');
    expect(movie.producers).toHaveLength(1);
    expect(movie.producers[0].name).toBe('Test Producer');
  });

  it('should not seed duplicate studios', async () => {
    await seederService.onModuleInit();
    await seederService.onModuleInit();

    const studios = await studioRepo.find();
    expect(studios).toHaveLength(1);
  });

  it('should not seed duplicate producers', async () => {
    await seederService.onModuleInit();
    await seederService.onModuleInit();

    const producers = await producerRepo.find();
    expect(producers).toHaveLength(1);
  });

  it('should seed multiple movies', async () => {
    const csvContent = `year;title;studios;producers;winner
              1980;Test Movie;Test Studio;Test Producer;yes
              1981;Test Movie 2;Test Studio 2;Test Producer 2;no`;

    writeFileSync(testCsvPath, csvContent);

    await seederService.onModuleInit();

    const movies = await movieRepo.find({
      relations: ['studios', 'producers'],
    });

    expect(movies).toHaveLength(2);

    const [movie1, movie2] = movies;
    expect(movie1.title).toBe('Test Movie');
    expect(movie1.releaseYear).toBe(1980);
    expect(movie1.winner).toBe(true);
    expect(movie1.studios).toHaveLength(1);
    expect(movie1.studios[0].name).toBe('Test Studio');
    expect(movie1.producers).toHaveLength(1);
    expect(movie1.producers[0].name).toBe('Test Producer');

    expect(movie2.title).toBe('Test Movie 2');
    expect(movie2.releaseYear).toBe(1981);
    expect(movie2.winner).toBe(false);
    expect(movie2.studios).toHaveLength(1);
    expect(movie2.studios[0].name).toBe('Test Studio 2');
    expect(movie2.producers).toHaveLength(1);
    expect(movie2.producers[0].name).toBe('Test Producer 2');
  });
});
