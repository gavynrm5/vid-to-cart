import { useState } from "react";
import { LinkInput } from "@/components/LinkInput";
import { ProductGrid } from "@/components/ProductGrid";
import { Product } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { LinkParser } from "@/utils/linkParser";
import { ProductMatcher } from "@/utils/productMatcher";
import { ProductCache } from "@/utils/cache";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (url: string, keywords: string) => {
    const cacheKey = ProductCache.generateKey(url || undefined, keywords.split(' '));
    
    // Check cache first
    const cached = ProductCache.getCached(cacheKey);
    if (cached) {
      setProducts(cached.products);
      setHasSearched(true);
      toast({
        title: "Loaded from Cache",
        description: `Found ${cached.products.length} products`,
      });
      return;
    }

    setIsVerifying(!!url);
    setIsLoading(!url);
    setHasSearched(true);
    
    try {
      let searchKeywords: string[] = [];
      
      if (url) {
        // Parse link for product info
        const linkData = await LinkParser.parseLink(url);
        searchKeywords = linkData.keywords;
        
        if (linkData.confidence < 0.5) {
          toast({
            title: "Link Analysis",
            description: "We found limited product info in this link. Try adding keywords for better results.",
            variant: "destructive",
          });
        }
      } else {
        // Use manual keywords
        searchKeywords = keywords.split(' ').filter(k => k.length > 2);
      }

      setIsVerifying(false);
      setIsLoading(true);

      // Search for products
      const result = await ProductMatcher.findProducts(searchKeywords, url ? 'tiktok' : 'other');
      
      if (result.products.length > 0) {
        setProducts(result.products);
        
        // Cache successful results
        if (ProductCache.shouldCache(result)) {
          ProductCache.setCached(cacheKey, result, url, searchKeywords);
        }
        
        toast({
          title: "Search Complete!",
          description: `Found ${result.products.length} products with ${Math.round(result.confidence * 100)}% match confidence`,
        });
      } else {
        toast({
          title: "No Products Found",
          description: "Try different keywords or check the link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed", 
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleBuyClick = (product: Product) => {
    toast({
      title: "Redirecting...",
      description: `Taking you to ${product.store} to complete your purchase`,
    });
    // In production: window.open(product.affiliateUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto py-8">
        {!hasSearched || products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <LinkInput onSearch={handleSearch} isLoading={isLoading} isVerifying={isVerifying} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <LinkInput onSearch={handleSearch} isLoading={isLoading} isVerifying={isVerifying} />
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