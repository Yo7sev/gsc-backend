import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity/player.entity';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(): Promise<Player[]> {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Player | null> {
    return this.playersService.findOne(id);
  }

  @Post()
  create(@Body() playerData: Partial<Player>): Promise<Player> {
    return this.playersService.create(playerData);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() playerData: Partial<Player>,
  ): Promise<Player | null> {
    return this.playersService.update(id, playerData);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
