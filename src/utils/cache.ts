import { Product } from '@/components/ProductCard';
import { ProductMatchResult } from './productMatcher';

export interface CacheEntry {
  data: ProductMatchResult;
  timestamp: number;
  url?: string;
  keywords: string[];
}

export class ProductCache {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly STORAGE_KEY = 'trendbuy_product_cache';
  private static readonly MAX_ENTRIES = 50; // Limit cache size

  static getCached(key: string): ProductMatchResult | null {
    try {
      const cache = this.getCache();
      const entry = cache[key];
      
      if (!entry) return null;
      
      // Check if entry is still valid
      const now = Date.now();
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.removeEntry(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  static setCached(key: string, data: ProductMatchResult, url?: string, keywords: string[] = []): void {
    try {
      const cache = this.getCache();
      
      // Remove oldest entries if cache is full
      const entries = Object.entries(cache);
      if (entries.length >= this.MAX_ENTRIES) {
        // Sort by timestamp and remove oldest
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, entries.length - this.MAX_ENTRIES + 1);
        toRemove.forEach(([key]) => delete cache[key]);
      }
      
      cache[key] = {
        data,
        timestamp: Date.now(),
        url,
        keywords
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  static generateKey(url?: string, keywords: string[] = []): string {
    if (url) {
      // Use URL as primary key for social links
      return `url:${url}`;
    }
    
    // Use keywords for manual searches
    return `keywords:${keywords.sort().join(',')}`;
  }

  static getRecentSearches(limit: number = 5): CacheEntry[] {
    try {
      const cache = this.getCache();
      const entries = Object.values(cache)
        .filter(entry => entry.data.products.length > 0)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
      
      return entries;
    } catch (error) {
      console.warn('Error getting recent searches:', error);
      return [];
    }
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  static getCacheStats(): { totalEntries: number; totalSize: string; oldestEntry?: Date } {
    try {
      const cache = this.getCache();
      const entries = Object.values(cache);
      const cacheString = localStorage.getItem(this.STORAGE_KEY) || '';
      
      let oldestEntry: Date | undefined;
      if (entries.length > 0) {
        const oldestTimestamp = Math.min(...entries.map(e => e.timestamp));
        oldestEntry = new Date(oldestTimestamp);
      }
      
      return {
        totalEntries: entries.length,
        totalSize: `${(cacheString.length / 1024).toFixed(1)} KB`,
        oldestEntry
      };
    } catch (error) {
      return { totalEntries: 0, totalSize: '0 KB' };
    }
  }

  private static getCache(): Record<string, CacheEntry> {
    try {
      const cacheStr = localStorage.getItem(this.STORAGE_KEY);
      return cacheStr ? JSON.parse(cacheStr) : {};
    } catch (error) {
      console.warn('Error parsing cache:', error);
      return {};
    }
  }

  private static removeEntry(key: string): void {
    try {
      const cache = this.getCache();
      delete cache[key];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Error removing cache entry:', error);
    }
  }

  // Helper method to check if a search should be cached
  static shouldCache(result: ProductMatchResult): boolean {
    return result.products.length > 0 && result.confidence > 0.3;
  }
}