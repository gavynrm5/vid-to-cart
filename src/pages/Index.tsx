import { useState } from "react";
import { LinkInput } from "@/components/LinkInput";
import { ProductGrid } from "@/components/ProductGrid";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Mock product data for demo
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Wireless Bluetooth Earbuds with Charging Case',
      price: 29.99,
      originalPrice: 79.99,
      rating: 4.5,
      reviewCount: 12453,
      imageUrl: 'https://images.unsplash.com/photo-1590658165737-15a047b1c24c?w=400&h=400&fit=crop',
      store: 'Amazon',
      affiliateUrl: '#',
      discount: 62
    },
    {
      id: '2', 
      title: 'Portable Phone Stand Holder Adjustable Desktop',
      price: 12.99,
      originalPrice: 24.99,
      rating: 4.3,
      reviewCount: 8921,
      imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop',
      store: 'Temu',
      affiliateUrl: '#',
      discount: 48
    },
    {
      id: '3',
      title: 'LED Strip Lights 16.4ft Color Changing Smart WiFi',
      price: 19.99,
      originalPrice: 39.99,
      rating: 4.7,
      reviewCount: 15632,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fbd51c2cd44d?w=400&h=400&fit=crop',
      store: 'Walmart',
      affiliateUrl: '#',
      discount: 50
    }
  ];

  const handleSearch = async (url: string, keywords: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would parse the URL/keywords and search APIs
      setProducts(mockProducts);
      
      toast({
        title: "Search Complete!",
        description: `Found ${mockProducts.length} products matching your search`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = (product: Product) => {
    // In a real app, this would track clicks and redirect to affiliate link
    toast({
      title: "Redirecting...",
      description: `Taking you to ${product.store} to complete your purchase`,
    });
    
    // Simulate opening affiliate link
    console.log(`Redirecting to: ${product.affiliateUrl}`);
  };

  const handleNewSearch = () => {
    setProducts([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {!hasSearched || products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <LinkInput onSearch={handleSearch} isLoading={isLoading} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <LinkInput onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <ProductGrid 
              products={products} 
              onBuyClick={handleBuyClick}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;