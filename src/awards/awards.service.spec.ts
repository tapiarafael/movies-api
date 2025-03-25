import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from 'src/entities';
import { AwardsService } from './awards.service';
import { SeederService } from 'src/seeder/seeder.service';
import { Repository } from 'typeorm';

describe('calculateProducerAwardsInterval - real dataset', () => {
  let service: AwardsService;
  let seeder: SeederService;
  let movieRepository: Repository<Movie>;

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
      providers: [AwardsService, SeederService],
    }).compile();

    service = module.get<AwardsService>(AwardsService);
    seeder = module.get<SeederService>(SeederService);
    movieRepository = module.get(getRepositoryToken(Movie));

    await seeder.onModuleInit();
  });

  it('should return correct intervals based on default CSV data', async () => {
    const result = await service.calculateProducerAwardsInterval();

    expect(result.min).toEqual(
      expect.arrayContaining([
        {
          producer: 'Joel Silver',
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ]),
    );

    expect(result.max).toEqual(
      expect.arrayContaining([
        {
          producer: 'Matthew Vaughn',
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ]),
    );
  });

  it('should call find method of movieRepository with correct params', async () => {
    const findSpy = jest.spyOn(movieRepository, 'find');

    await service.calculateProducerAwardsInterval();

    expect(findSpy).toHaveBeenCalledWith({
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
  });
});
