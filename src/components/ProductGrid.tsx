import { ProductCard, Product } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface ProductGridProps {
  products: Product[];
  onBuyClick: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductGrid = ({ products, onBuyClick, isLoading = false }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'discount'>('price');

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        const aDiscount = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : a.discount || 0;
        const bDiscount = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : b.discount || 0;
        return bDiscount - aDiscount;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching for the best deals...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products found. Try a different search!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">
            Best Deals Found
          </h2>
          <Badge variant="secondary" className="text-sm">
            {products.length} products
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'price' ? 'rating' : sortBy === 'rating' ? 'discount' : 'price')}
            className="transition-smooth"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by {sortBy === 'price' ? 'Price' : sortBy === 'rating' ? 'Rating' : 'Discount'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onBuyClick={onBuyClick}
          />
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Prices and availability subject to change
        </p>
      </div>
    </div>
  );
};