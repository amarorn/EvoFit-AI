import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from '../../application/services/workouts.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { GenerateWorkoutWithAssessmentDto } from '../dto/assessment.dto';

@ApiTags('Workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gerar novo treino com IA (usa perfil do usuario)' })
  async generate(@CurrentUser('sub') userId: string) {
    return this.workoutsService.generate(userId);
  }

  @Post('generate-with-assessment')
  @ApiOperation({ summary: 'Gerar treino com dados da avaliacao' })
  async generateWithAssessment(
    @CurrentUser('sub') userId: string,
    @Body() dto: GenerateWorkoutWithAssessmentDto,
  ) {
    return this.workoutsService.generateWithAssessment(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar treinos do usuario' })
  async list(@CurrentUser('sub') userId: string) {
    return this.workoutsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um treino' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.findById(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar treino' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.workoutsService.delete(id, userId);
  }
}
