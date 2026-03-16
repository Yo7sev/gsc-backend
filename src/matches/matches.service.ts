import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  async create(matchData: Partial<Match>): Promise<Match> {
    const match = this.matchesRepository.create(matchData);
    return this.matchesRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchesRepository.find();
  }

  async findOne(id: number): Promise<Match | null> {
    return this.matchesRepository.findOneBy({ id });
  }

  async findUpcoming(): Promise<Match[]> {
    return this.matchesRepository.find({
      where: { status: MatchStatus.UPCOMING },
      order: { matchDate: 'ASC' },
    });
  }

  async update(id: number, matchData: Partial<Match>): Promise<Match | null> {
    await this.matchesRepository.update(id, matchData);
    return this.findOne(id);
  }

  async cancel(id: number): Promise<Match | null> {
    await this.matchesRepository.update(id, { status: MatchStatus.CANCELLED });
    return this.findOne(id);
  }
}
