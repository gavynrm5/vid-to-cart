import { Product } from '@/components/ProductCard';

// Product matching logic with API integration and similarity scoring
export interface ProductMatchResult {
  products: Product[];
  confidence: number;
  source: 'api' | 'fallback' | 'cache';
}

export class ProductMatcher {
  private static readonly SIMILARITY_THRESHOLD = 0.9;

  static async findProducts(keywords: string[], platform: string): Promise<ProductMatchResult> {
    const searchQuery = keywords.join(' ').toLowerCase();
    
    try {
      // First try primary APIs (Amazon, etc.)
      const apiResults = await this.searchProductAPIs(searchQuery);
      
      if (apiResults.products.length > 0) {
        return {
          ...apiResults,
          source: 'api',
          confidence: this.calculateMatchConfidence(searchQuery, apiResults.products)
        };
      }

      // Fallback to curated list
      const fallbackResults = await this.searchFallbackList(searchQuery, platform);
      return {
        products: fallbackResults,
        source: 'fallback',
        confidence: 0.8
      };
    } catch (error) {
      console.error('Product search failed:', error);
      return {
        products: [],
        source: 'api',
        confidence: 0
      };
    }
  }

  private static async searchProductAPIs(query: string): Promise<{ products: Product[] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock API response with keyword-matched products
    const mockProducts: Product[] = [];

    if (query.includes('earbuds') || query.includes('headphones') || query.includes('airpods')) {
      mockProducts.push({
        id: 'earbuds-1',
        title: 'Wireless Bluetooth Earbuds with Charging Case - Premium Sound Quality',
        price: 29.99,
        originalPrice: 79.99,
        rating: 4.5,
        reviewCount: 12453,
        imageUrl: 'https://images.unsplash.com/photo-1590658165737-15a047b1c24c?w=400&h=400&fit=crop',
        store: 'Amazon',
        affiliateUrl: 'https://amazon.com/affiliate-link-1',
        discount: 62
      });
    }

    if (query.includes('skincare') || query.includes('serum') || query.includes('face')) {
      mockProducts.push({
        id: 'skincare-1',
        title: 'Vitamin C Serum for Face - Anti-Aging Skincare with Hyaluronic Acid',
        price: 19.95,
        originalPrice: 39.99,
        rating: 4.7,
        reviewCount: 8921,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        store: 'Amazon',
        affiliateUrl: 'https://amazon.com/affiliate-link-2',
        discount: 50
      });
    }

    if (query.includes('led') || query.includes('lights') || query.includes('strip')) {
      mockProducts.push({
        id: 'led-1',
        title: 'LED Strip Lights 50ft - Smart WiFi Color Changing Room Lights',
        price: 24.99,
        originalPrice: 49.99,
        rating: 4.6,
        reviewCount: 15632,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fbd51c2cd44d?w=400&h=400&fit=crop',
        store: 'Amazon',
        affiliateUrl: 'https://amazon.com/affiliate-link-3',
        discount: 50
      });
    }

    if (query.includes('phone') && query.includes('case')) {
      mockProducts.push({
        id: 'case-1',
        title: 'Clear Phone Case with Camera Protection - Shockproof Design',
        price: 12.99,
        originalPrice: 24.99,
        rating: 4.4,
        reviewCount: 6789,
        imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop',
        store: 'Amazon',
        affiliateUrl: 'https://amazon.com/affiliate-link-4',
        discount: 48
      });
    }

    // Add Walmart/Temu alternatives for price comparison
    if (mockProducts.length > 0) {
      const originalProduct = mockProducts[0];
      
      mockProducts.push({
        ...originalProduct,
        id: originalProduct.id + '-walmart',
        price: originalProduct.price * 0.9, // Slightly cheaper
        store: 'Walmart',
        affiliateUrl: 'https://walmart.com/affiliate-link'
      });

      mockProducts.push({
        ...originalProduct,
        id: originalProduct.id + '-temu',
        price: originalProduct.price * 0.7, // Much cheaper but longer shipping
        rating: originalProduct.rating - 0.2,
        store: 'Temu',
        affiliateUrl: 'https://temu.com/affiliate-link'
      });
    }

    return { products: mockProducts };
  }

  private static async searchFallbackList(query: string, platform: string): Promise<Product[]> {
    // Import fallback data
    const { getTrendingProducts } = await import('./fallbackData');
    const trendingProducts = getTrendingProducts();

    // Filter products based on query similarity
    return trendingProducts.filter(product => {
      const similarity = this.calculateStringSimilarity(
        query,
        product.title.toLowerCase()
      );
      return similarity > 0.5; // Lower threshold for fallback
    });
  }

  private static calculateMatchConfidence(query: string, products: Product[]): number {
    if (products.length === 0) return 0;

    const similarities = products.map(product => 
      this.calculateStringSimilarity(query, product.title.toLowerCase())
    );

    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    return Math.min(avgSimilarity + 0.1, 1.0); // Slight boost for API results
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity for keyword matching
    const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(str2.split(' ').filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  static shouldShowConfirmationPrompt(confidence: number): boolean {
    return confidence < 0.7;
  }

  static generateConfirmationMessage(keywords: string[], products: Product[]): string {
    const topProduct = products[0];
    const keywordStr = keywords.slice(0, 2).join(' ');
    
    return `We found "${topProduct?.title}" for "${keywordStr}". Is this what you were looking for?`;
  }
}