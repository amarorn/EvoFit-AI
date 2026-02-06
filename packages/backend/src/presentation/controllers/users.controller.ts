import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { UpdateProfileDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuario autenticado' })
  async getMe(@CurrentUser('sub') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return { success: false };
    return this.usersService.toPublic(user);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil' })
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(userId, dto);
    return this.usersService.toPublic(user);
  }
}
