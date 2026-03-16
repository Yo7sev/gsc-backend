import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity/match.entity';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // Admin creates a match
  @Post()
  create(@Body() matchData: Partial<Match>): Promise<Match> {
    return this.matchesService.create(matchData);
  }

  // Get all matches
  @Get()
  findAll(): Promise<Match[]> {
    return this.matchesService.findAll();
  }

  // Get upcoming matches
  @Get('upcoming')
  findUpcoming(): Promise<Match[]> {
    return this.matchesService.findUpcoming();
  }

  // Get one match
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Match | null> {
    return this.matchesService.findOne(id);
  }

  // Admin updates a match
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() matchData: Partial<Match>,
  ): Promise<Match | null> {
    return this.matchesService.update(id, matchData);
  }

  // Admin cancels a match
  @Patch(':id/cancel')
  cancel(@Param('id') id: number): Promise<Match | null> {
    return this.matchesService.cancel(id);
  }
}
