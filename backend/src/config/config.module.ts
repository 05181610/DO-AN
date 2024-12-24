import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Làm cho config có sẵn trong toàn bộ ứng dụng
    }),
  ],
})
export class ConfigModule {} 