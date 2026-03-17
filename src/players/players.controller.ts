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

  // Step 1: Register player → sends OTP
  @Post('register')
  register(
    @Body() playerData: Partial<Player>,
  ): Promise<{ message: string; playerId: number }> {
    return this.playersService.register(playerData);
  }

  // Step 2: Verify OTP → account activated
  @Post('verify-email')
  verifyEmail(
    @Body('email') email: string,
    @Body('code') code: string,
  ): Promise<{ message: string }> {
    return this.playersService.verifyEmail(email, code);
  }

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
