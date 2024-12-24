import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Log database connection info (remove in production)
  logger.log(`Database: ${configService.get('DB_DATABASE')}`);
  logger.log(`Host: ${configService.get('DB_HOST')}`);
  
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true
  });

  const port = configService.get('PORT');
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();