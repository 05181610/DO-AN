import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Room } from '../rooms/entities/room.entity';
import { SearchAnalyzerService } from './services/search-analyzer.service';
import { AdvancedSearchService } from './services/advanced-search.service';
import { NLPService } from './services/nlp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room])
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, SearchAnalyzerService, AdvancedSearchService, NLPService],
  exports: [ChatbotService, SearchAnalyzerService, AdvancedSearchService, NLPService]
})
export class ChatbotModule {}