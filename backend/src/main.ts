import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Log database connection info (remove in production)
  logger.log(`Database: ${configService.get('DB_DATABASE')}`);
  logger.log(`Host: ${configService.get('DB_HOST')}`);
  
  // Serve static files from uploads directory
  // Use absolute path to uploads folder
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  logger.log(`Serving static files from: ${uploadsPath}`);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization']
  });

  const port = configService.get('PORT');
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();