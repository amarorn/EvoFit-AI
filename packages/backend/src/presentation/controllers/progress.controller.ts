import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from '../../application/services/progress.service';
import { RecordProgressDto } from '../dto/progress.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('record')
  @ApiOperation({ summary: 'Registrar execucao de exercicio' })
  async record(
    @CurrentUser('sub') userId: string,
    @Body() dto: RecordProgressDto,
  ) {
    return this.progressService.record(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter relatorio de progresso' })
  async list(
    @CurrentUser('sub') userId: string,
    @Query('days') days?: string,
  ) {
    const d = days ? parseInt(days, 10) : 30;
    return this.progressService.getByUser(userId, d);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatisticas' })
  async stats(
    @CurrentUser('sub') userId: string,
    @Query('days') days?: string,
  ) {
    const d = days ? parseInt(days, 10) : 7;
    return this.progressService.getStats(userId, d);
  }
}
