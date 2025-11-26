import { Injectable, Logger } from '@nestjs/common';

export interface NLPQuery {
  intents: string[];
  entities: {
    priceMin?: number;
    priceMax?: number;
    districts?: string[];
    types?: string[];
    facilities?: string[];
    keywords?: string[];
  };
  negations?: string[];
  modifiers?: string[];
}

@Injectable()
export class NLPService {
  private readonly logger = new Logger(NLPService.name);

  private readonly synonyms = {
    price: ['giá', 'tiền', 'chi phí', 'gía', 'triệu', 'tệ'],
    area: ['diện tích', 'rộng', 'tầng', 'phòng', 'ngủ', 'khỏe'],
    location: ['khu', 'vực', 'quận', 'huyện', 'đường', 'khu vực', 'ở', 'tại'],
    quality: ['cao cấp', 'đẹp', 'mới', 'hiện đại', 'sạch', 'yên tĩnh'],
    budget: ['rẻ', 'giá rẻ', 'rẻ tiền', 'hợp lý', 'vừa túi tiền'],
    emergency: ['gấp', 'nhanh', 'cấp', 'vội', 'càng sớm càng tốt'],
    family: ['gia đình', 'vợ chồng', 'con cái', 'gia đình nhỏ', 'gia đình 3-4 người'],
    student: ['sinh viên', 'học sinh', 'đại học', 'trường', 'trẻ', 'bạn trẻ'],
    business: ['kinh doanh', 'công ty', 'văn phòng', 'shop', 'cửa hàng', 'mặt tiền']
  };

  private readonly negationWords = [
    'không', 'ko', 'chứ', 'trừ', 'ngoại trừ', 'chỉ cần',
    'không muốn', 'không cần', 'bỏ qua', 'không có'
  ];

  private readonly intensifiers = [
    'rất', 'cực', 'siêu', 'vô cùng', 'dã man', 'tận cùng'
  ];

  /**
   * Parse query thành structured NLP data
   */
  parseQuery(query: string): NLPQuery {
    const lowerQuery = query.toLowerCase();

    // Detect intents
    const intents = this.detectIntents(query);

    // Extract entities
    const entities = this.extractEntities(query);

    // Detect negations
    const negations = this.detectNegations(query);

    // Detect modifiers
    const modifiers = this.detectModifiers(query);

    return {
      intents,
      entities,
      negations,
      modifiers
    };
  }

  private detectIntents(query: string): string[] {
    const intents: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Search intent
    if (/tìm|search|kiếm|muốn|cần|hỏi|ask|looking/i.test(query)) {
      intents.push('SEARCH');
    }

    // Budget conscious
    if (/rẻ|budget|tiết kiệm|hợp lý|vừa|giá rẻ/i.test(query)) {
      intents.push('BUDGET');
    }

    // Luxury/quality
    if (/cao cấp|sang|đẹp|hiện đại|mới|luxury/i.test(query)) {
      intents.push('PREMIUM');
    }

    // Family
    if (/gia đình|vợ chồng|con|bé|nhỏ/i.test(query)) {
      intents.push('FAMILY');
    }

    // Student
    if (/sinh viên|học sinh|trẻ|bạn trẻ/i.test(query)) {
      intents.push('STUDENT');
    }

    // Business
    if (/kinh doanh|shop|cửa hàng|văn phòng|công ty/i.test(query)) {
      intents.push('BUSINESS');
    }

    // Emergency
    if (/gấp|nhanh|vội|cấp/i.test(query)) {
      intents.push('URGENT');
    }

    return intents.length > 0 ? intents : ['SEARCH'];
  }

  private extractEntities(query: string): NLPQuery['entities'] {
    const entities: NLPQuery['entities'] = {};

    // Extract keywords
    const keywords = query
      .split(/[\s,;.!?]/)
      .filter(w => w.length > 2 && !this.isCommonWord(w))
      .map(w => w.toLowerCase());
    
    if (keywords.length > 0) {
      entities.keywords = keywords;
    }

    return entities;
  }

  private detectNegations(query: string): string[] {
    const negations: string[] = [];
    const lowerQuery = query.toLowerCase();

    this.negationWords.forEach(word => {
      if (lowerQuery.includes(word)) {
        negations.push(word);
      }
    });

    return negations;
  }

  private detectModifiers(query: string): string[] {
    const modifiers: string[] = [];
    const lowerQuery = query.toLowerCase();

    this.intensifiers.forEach(word => {
      if (lowerQuery.includes(word)) {
        modifiers.push(word);
      }
    });

    return modifiers;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'và', 'hoặc', 'để', 'có', 'là', 'cái', 'chiếc', 'một', 'hai', 'ba',
      'tìm', 'search', 'kiếm', 'muốn', 'cần', 'hỏi', 'ask', 'looking',
      'từ', 'đến', 'ở', 'tại', 'thôi', 'nữa', 'mà', 'vậy', 'được'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Handle negation queries
   * VD: "Tìm phòng không có wifi" -> search for rooms WITHOUT wifi
   */
  handleNegation(query: string, facilities: string[]): { include: string[], exclude: string[] } {
    const lowerQuery = query.toLowerCase();
    const include: string[] = [];
    const exclude: string[] = [];

    facilities.forEach(facility => {
      const facilityLower = facility.toLowerCase();
      if (lowerQuery.includes(`không ${facilityLower}`) || 
          lowerQuery.includes(`ko ${facilityLower}`) ||
          lowerQuery.includes(`trừ ${facilityLower}`)) {
        exclude.push(facility);
      } else if (lowerQuery.includes(facilityLower)) {
        include.push(facility);
      }
    });

    return { include, exclude };
  }

  /**
   * Suggest queries based on context
   */
  generateSuggestions(intent: string, criteria: any): string[] {
    const suggestions: string[] = [];

    if (intent === 'BUDGET') {
      suggestions.push('Tìm phòng dưới 2 triệu có wifi');
      suggestions.push('Tìm phòng trọ giá rẻ ở Nhân Bình');
      suggestions.push('Tìm phòng trọ dưới 1.5 triệu');
    } else if (intent === 'FAMILY') {
      suggestions.push('Tìm nhà nguyên căn có sân');
      suggestions.push('Tìm chung cư 3 phòng ngủ');
      suggestions.push('Tìm nhà rộng cho gia đình');
    } else if (intent === 'STUDENT') {
      suggestions.push('Tìm phòng trọ gần trường đại học');
      suggestions.push('Tìm phòng trọ sinh viên rẻ');
      suggestions.push('Tìm phòng có wifi cho sinh viên');
    } else if (intent === 'BUSINESS') {
      suggestions.push('Tìm nhà mặt tiền thích hợp kinh doanh');
      suggestions.push('Tìm chung cư thích hợp làm văn phòng');
      suggestions.push('Tìm nhà phố thích hợp mở shop');
    }

    return suggestions;
  }

  /**
   * Validate query quality
   */
  getQueryQuality(query: string): 'low' | 'medium' | 'high' {
    let score = 0;

    // Has price criteria
    if (/\d+\s*triệu|dưới|từ|đến/.test(query)) score += 2;

    // Has location criteria
    if (/ở|tại|khu|vực|quận|huyện|đường/.test(query)) score += 2;

    // Has type criteria
    if (/chung cư|phòng trọ|nhà|nguyên căn|apartment|motel|house/.test(query)) score += 2;

    // Has facilities criteria
    if (/wifi|máy lạnh|máy giặt|tủ lạnh|ban công/.test(query)) score += 1;

    // Has intent modifiers
    if (/gấp|vội|cấp|nhanh|cao cấp|sang/.test(query)) score += 1;

    if (score >= 5) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }
}
