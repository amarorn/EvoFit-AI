import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { AuthModule } from './presentation/modules/auth.module';
import { UsersModule } from './presentation/modules/users.module';
import { WorkoutsModule } from './presentation/modules/workouts.module';
import { ProgressModule } from './presentation/modules/progress.module';
import { ChatModule } from './presentation/modules/chat.module';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    WorkoutsModule,
    ProgressModule,
    ChatModule,
  ],
})
export class AppModule {}
