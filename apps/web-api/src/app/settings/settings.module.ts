import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Platform], 'monitoring')],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
