import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from 'src/entities';

describe('SeederService (integration)', () => {
  let seederService: SeederService;
  let movieRepo: Repository<Movie>;
  let producerRepo: Repository<Producer>;
  let studioRepo: Repository<Studio>;

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

  it('should fully seed the database from the default movielist.csv file', async () => {
    await seederService.onModuleInit();

    const movies = await movieRepo.find({
      relations: ['studios', 'producers'],
    });
    const producers = await producerRepo.find();
    const studios = await studioRepo.find();

    expect(movies.length).toBe(206);
    expect(producers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Joel Silver' }),
        expect.objectContaining({ name: 'Matthew Vaughn' }),
      ]),
    );
    expect(studios).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Warner Bros.' }),
      ]),
    );

    const joelSilverMovies = movies.filter((movie) =>
      movie.producers.some((p) => p.name === 'Joel Silver'),
    );
    expect(joelSilverMovies.length).toBeGreaterThanOrEqual(2);
  });

  it('should not create duplicate studios when seeding multiple times', async () => {
    await seederService.onModuleInit();
    const initialStudios = await studioRepo.find();
    const initialCount = initialStudios.length;

    await seederService.onModuleInit();
    const afterReseed = await studioRepo.find();

    expect(afterReseed.length).toBe(initialCount);
  });

  it('should not create duplicate producers when seeding multiple times', async () => {
    await seederService.onModuleInit();
    const initialProducers = await producerRepo.find();
    const initialCount = initialProducers.length;

    await seederService.onModuleInit();
    const afterReseed = await producerRepo.find();

    expect(afterReseed.length).toBe(initialCount);
  });
});
