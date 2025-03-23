import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Studio } from './studio.entity';
import { Producer } from './producer.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  releaseYear: number;

  @Column({ default: false })
  winner: boolean;

  @ManyToMany(() => Studio, (studio) => studio.movies, { cascade: true })
  @JoinTable()
  studios: Studio[];

  @ManyToMany(() => Producer, (producer) => producer.movies, { cascade: true })
  @JoinTable()
  producers: Producer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
