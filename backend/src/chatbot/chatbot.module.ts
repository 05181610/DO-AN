import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Room } from '../rooms/entities/room.entity';
import { SearchAnalyzerService } from './services/search-analyzer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room])
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, SearchAnalyzerService],
  exports: [ChatbotService, SearchAnalyzerService]
})
export class ChatbotModule {}