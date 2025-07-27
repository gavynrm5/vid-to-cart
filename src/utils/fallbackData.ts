import { Product } from '@/components/ProductCard';

// Curated fallback list of trending TikTok/Instagram/YouTube products mapped to actual products
export const trendingProducts: Product[] = [
  // TikTok skincare viral products
  {
    id: 'trending-skincare-1',
    title: 'The INKEY List Hyaluronic Acid Serum - Viral TikTok Skincare',
    price: 12.99,
    originalPrice: 18.99,
    rating: 4.6,
    reviewCount: 24531,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-skincare-1',
    discount: 32
  },
  
  // Viral tech gadgets
  {
    id: 'trending-tech-1',
    title: 'Anker Wireless Earbuds - Featured in Tech TikTok',
    price: 39.99,
    originalPrice: 79.99,
    rating: 4.5,
    reviewCount: 18642,
    imageUrl: 'https://images.unsplash.com/photo-1590658165737-15a047b1c24c?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-tech-1',
    discount: 50
  },

  // Home decor viral items
  {
    id: 'trending-home-1',
    title: 'Govee LED Strip Lights - Instagram Room Transformation',
    price: 22.99,
    originalPrice: 45.99,
    rating: 4.7,
    reviewCount: 31247,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fbd51c2cd44d?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-home-1',
    discount: 50
  },

  // Fashion accessories
  {
    id: 'trending-fashion-1',
    title: 'Crossbody Phone Case - TikTok Fashion Must-Have',
    price: 15.99,
    originalPrice: 29.99,
    rating: 4.3,
    reviewCount: 9876,
    imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-fashion-1',
    discount: 47
  },

  // Kitchen gadgets
  {
    id: 'trending-kitchen-1',
    title: 'Ninja Foodi Personal Blender - YouTube Kitchen Haul Favorite',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewCount: 15432,
    imageUrl: 'https://images.unsplash.com/photo-1585515656618-7a1c2d5e2d30?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-kitchen-1',
    discount: 20
  },

  // Wellness/self-care
  {
    id: 'trending-wellness-1',
    title: 'Jade Facial Roller and Gua Sha Set - Wellness TikTok',
    price: 14.99,
    originalPrice: 34.99,
    rating: 4.4,
    reviewCount: 7654,
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    store: 'Amazon',
    affiliateUrl: 'https://amazon.com/trending-wellness-1',
    discount: 57
  }
];

// Platform-specific trending maps
export const platformTrends = {
  tiktok: {
    skincare: ['trending-skincare-1', 'trending-wellness-1'],
    tech: ['trending-tech-1'],
    home: ['trending-home-1'],
    fashion: ['trending-fashion-1']
  },
  instagram: {
    fashion: ['trending-fashion-1'],
    home: ['trending-home-1'],
    wellness: ['trending-wellness-1']
  },
  youtube: {
    tech: ['trending-tech-1'],
    kitchen: ['trending-kitchen-1'],
    home: ['trending-home-1']
  }
};

export function getTrendingProducts(platform?: string, category?: string): Product[] {
  if (!platform || !category) {
    return trendingProducts;
  }

  const platformData = platformTrends[platform as keyof typeof platformTrends];
  if (!platformData || !platformData[category as keyof typeof platformData]) {
    return trendingProducts;
  }

  const trendingIds = platformData[category as keyof typeof platformData];
  return trendingProducts.filter(product => trendingIds.includes(product.id));
}

export function getProductByKeywords(keywords: string[]): Product[] {
  const keywordStr = keywords.join(' ').toLowerCase();
  
  return trendingProducts.filter(product => {
    const productText = product.title.toLowerCase();
    return keywords.some(keyword => 
      productText.includes(keyword.toLowerCase())
    );
  });
}