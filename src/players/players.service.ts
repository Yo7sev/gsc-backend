import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

  async findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  async findOne(id: number): Promise<Player | null> {
    return this.playersRepository.findOneBy({ id });
  }

  async create(playerData: Partial<Player>): Promise<Player> {
    const player = this.playersRepository.create(playerData);
    return this.playersRepository.save(player);
  }

  async update(
    id: number,
    playerData: Partial<Player>,
  ): Promise<Player | null> {
    await this.playersRepository.update(id, playerData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.playersRepository.delete(id);
  }
}
