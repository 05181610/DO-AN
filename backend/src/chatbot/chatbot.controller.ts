import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SearchRequirements } from './interfaces/search-requirements.interface';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('query')
  async handleQuery(@Body() body: { query: string }) {
    try {
      console.log('Received query:', body.query);
      const result = await this.chatbotService.handleUserQuery(body.query);
      console.log('Response:', result);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        success: false,
        error: error.message || 'Internal server error',
        type: 'error'
      };
    }
  }

  // Thêm endpoint test để kiểm tra tất cả các phòng
  @Get('test/all')
  async testAllRooms() {
    const requirements: SearchRequirements = {
      priceRange: null,
      district: null,
      type: null,
      facilities: [],
      minPrice: null,
      maxPrice: null,
      suggestedDistricts: [],
      alternativePriceRanges: []
    };
    return this.chatbotService.searchRooms(requirements);
  }

  @Get('test/price-range')
  async testPriceRange() {
    const requirements: SearchRequirements = {
      priceRange: "2-4",
      district: null,
      type: null,
      facilities: [],
      minPrice: 2000000,
      maxPrice: 4000000,
      suggestedDistricts: [],
      alternativePriceRanges: []
    };
    return this.chatbotService.searchRooms(requirements);
  }

  @Get('test/district')
  async testDistrict() {
    const requirements: SearchRequirements = {
      priceRange: null,
      district: "Nhân Bình",
      type: null,
      facilities: [],
      minPrice: null,
      maxPrice: null,
      suggestedDistricts: [],
      alternativePriceRanges: []
    };
    return this.chatbotService.searchRooms(requirements);
  }

  @Get('test/facilities')
  async testFacilities() {
    const requirements: SearchRequirements = {
      priceRange: null,
      district: null,
      type: null,
      facilities: ["Máy lạnh", "Wifi"],
      minPrice: null,
      maxPrice: null,
      suggestedDistricts: [],
      alternativePriceRanges: []
    };
    return this.chatbotService.searchRooms(requirements);
  }

  @Post('test/advanced-search')
  async testAdvancedSearch(@Body() body: { query: string }) {
    return this.handleQuery(body);
  }
}