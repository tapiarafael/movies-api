import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { existsSync } from 'fs';

describe('SeederService (integration)', () => {
  let seederService: SeederService;
  let prisma: PrismaService;

  const testCsvPath = join(__dirname, 'test-movielist.csv');

  // Sample mini CSV to test
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
      providers: [SeederService, PrismaService],
    }).compile();

    seederService = module.get<SeederService>(SeederService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.movie.deleteMany();
    await prisma.producer.deleteMany();
    await prisma.studio.deleteMany();
  });

  it('should be defined', () => {
    expect(seederService).toBeDefined();
  });

  it('should seed data from CSV into the database', async () => {
    await seederService.onModuleInit();

    const movies = await prisma.movie.findMany({
      include: {
        studios: true,
        producers: true,
      },
    });

    expect(movies).toHaveLength(1);
    expect(movies[0].title).toBe('Test Movie');
    expect(movies[0].winner).toBe(true);
    expect(movies[0].producers).toHaveLength(1);
    expect(movies[0].studios).toHaveLength(1);
    expect(movies[0].releaseYear).toBe(1980);
    expect(movies[0].studios).toMatchObject([
      {
        name: 'Test Studio',
      },
    ]);
    expect(movies[0].producers).toMatchObject([
      {
        name: 'Test Producer',
      },
    ]);
  });

  it('should not duplicate data when run twice', async () => {
    await seederService.onModuleInit();
    await seederService.onModuleInit();

    const movies = await prisma.movie.findMany();
    const producers = await prisma.producer.findMany();
    const studios = await prisma.studio.findMany();

    expect(movies).toHaveLength(1);
    expect(producers).toHaveLength(1);
    expect(studios).toHaveLength(1);
  });
});
