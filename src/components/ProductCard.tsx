import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, TrendingDown } from "lucide-react";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  store: 'Amazon' | 'Walmart' | 'Temu' | 'Other';
  affiliateUrl: string;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
}

export const ProductCard = ({ product, onBuyClick }: ProductCardProps) => {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  const storeColors = {
    Amazon: 'bg-[#ff9900]',
    Walmart: 'bg-[#004c91]', 
    Temu: 'bg-[#1976d2]',
    Other: 'bg-muted'
  };

  return (
    <Card className="group overflow-hidden bg-gradient-card shadow-card hover:shadow-floating transition-all duration-300 transform hover:scale-[1.02] border-0">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {discountPercentage && discountPercentage > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 left-3 bg-gradient-deal text-accent-foreground font-bold shadow-deal"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            {discountPercentage}% OFF
          </Badge>
        )}
        
        <Badge 
          className={`absolute top-3 right-3 text-white font-semibold ${storeColors[product.store]}`}
        >
          {product.store}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {discountPercentage && discountPercentage > 0 && (
            <div className="text-sm text-success font-medium">
              Save ${((product.originalPrice || product.price) - product.price).toFixed(2)}
            </div>
          )}
        </div>

        <Button
          variant="buy"
          size="lg"
          onClick={() => onBuyClick(product)}
          className="w-full mt-4"
        >
          <ExternalLink className="h-4 w-4" />
          Buy Now on {product.store}
        </Button>
      </div>
    </Card>
  );
};