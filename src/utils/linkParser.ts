// Link parsing and metadata extraction utility
export interface LinkMetadata {
  title?: string;
  description?: string;
  keywords: string[];
  platform: 'tiktok' | 'instagram' | 'youtube' | 'amazon' | 'other';
  productName?: string;
  confidence: number; // 0-1 score for match confidence
}

export class LinkParser {
  private static platformPatterns = {
    tiktok: /(?:tiktok\.com|vm\.tiktok\.com)/i,
    instagram: /(?:instagram\.com|instagr\.am)/i,
    youtube: /(?:youtube\.com|youtu\.be)/i,
    amazon: /amazon\.(com|co\.uk|ca|de|fr|it|es|in|au|br|mx)/i,
  };

  static async parseLink(url: string): Promise<LinkMetadata> {
    const platform = this.detectPlatform(url);
    
    try {
      // First try to extract metadata via proxy or CORS-enabled service
      const metadata = await this.extractMetadata(url);
      
      // Enhance with AI-powered keyword extraction
      const keywords = await this.extractProductKeywords(metadata.title || '', metadata.description || '', platform);
      
      return {
        ...metadata,
        platform,
        keywords,
        confidence: this.calculateConfidence(metadata, keywords, platform)
      };
    } catch (error) {
      console.warn('Failed to parse link metadata:', error);
      
      // Fallback to URL-based parsing
      return this.fallbackParsing(url, platform);
    }
  }

  private static detectPlatform(url: string): LinkMetadata['platform'] {
    for (const [platform, pattern] of Object.entries(this.platformPatterns)) {
      if (pattern.test(url)) {
        return platform as keyof typeof this.platformPatterns;
      }
    }
    return 'other';
  }

  private static async extractMetadata(url: string): Promise<Partial<LinkMetadata>> {
    // In a real implementation, this would use a service like:
    // - OpenGraph metadata extraction
    // - YouTube API for video titles
    // - Custom scraping service
    
    // For now, simulate metadata extraction
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response based on URL patterns
    if (url.includes('tiktok')) {
      return {
        title: 'Amazing skincare routine that changed my life! #skincare #glowup',
        description: 'Check out this incredible product that transformed my skin...'
      };
    }
    
    if (url.includes('youtube')) {
      return {
        title: 'AMAZON HAUL 2024 - Best Tech Gadgets Under $50!',
        description: 'I found the coolest tech gadgets on Amazon for under $50. Links in description!'
      };
    }

    if (url.includes('instagram')) {
      return {
        title: 'New wireless earbuds are a game changer! 🎧',
        description: 'These bluetooth earbuds have the best sound quality for the price'
      };
    }

    return {};
  }

  private static async extractProductKeywords(title: string, description: string, platform: string): Promise<string[]> {
    const text = `${title} ${description}`.toLowerCase();
    
    // Common product indicators
    const productPatterns = [
      /(\w+\s+)?(?:earbuds?|headphones?|airpods?)/gi,
      /(\w+\s+)?(?:skincare|serum|moisturizer|cleanser)/gi,
      /(\w+\s+)?(?:phone\s+case|case|cover)/gi,
      /(\w+\s+)?(?:led\s+lights?|strip\s+lights?)/gi,
      /(\w+\s+)?(?:bluetooth|wireless|usb)/gi,
      /(\w+\s+)?(?:gadget|device|tech)/gi,
    ];

    const keywords = new Set<string>();
    
    // Extract brand names and product types
    productPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          keywords.add(match.trim());
        });
      }
    });

    // Platform-specific keyword extraction
    if (platform === 'tiktok' && text.includes('skincare')) {
      keywords.add('skincare routine');
      keywords.add('face serum');
    }

    if (text.includes('amazon haul')) {
      keywords.add('tech gadgets');
      keywords.add('amazon finds');
    }

    return Array.from(keywords).slice(0, 5); // Limit to top 5 keywords
  }

  private static calculateConfidence(metadata: Partial<LinkMetadata>, keywords: string[], platform: string): number {
    let confidence = 0.3; // Base confidence

    // Boost confidence for clear product indicators
    if (metadata.title && this.hasProductIndicators(metadata.title)) {
      confidence += 0.3;
    }

    if (keywords.length > 0) {
      confidence += 0.2;
    }

    // Platform-specific confidence adjustments
    if (platform === 'amazon') {
      confidence += 0.4; // Amazon links are likely product-related
    }

    return Math.min(confidence, 1.0);
  }

  private static hasProductIndicators(text: string): boolean {
    const indicators = [
      'buy', 'purchase', 'product', 'review', 'haul', 'unboxing',
      'best', 'top', 'under', '$', 'price', 'deal', 'sale'
    ];
    
    const lowerText = text.toLowerCase();
    return indicators.some(indicator => lowerText.includes(indicator));
  }

  private static fallbackParsing(url: string, platform: LinkMetadata['platform']): LinkMetadata {
    // Extract basic info from URL structure
    const keywords: string[] = [];
    
    if (platform === 'amazon') {
      // Try to extract product info from Amazon URL
      const productMatch = url.match(/\/([^\/]+)\/dp\/\w+/);
      if (productMatch) {
        keywords.push(productMatch[1].replace(/-/g, ' '));
      }
    }

    return {
      platform,
      keywords,
      confidence: 0.2 // Low confidence for fallback
    };
  }
}