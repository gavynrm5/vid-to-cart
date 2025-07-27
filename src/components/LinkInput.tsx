import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Link as LinkIcon, Sparkles, Clock } from "lucide-react";
import { ProductCache } from "@/utils/cache";

interface LinkInputProps {
  onSearch: (url: string, keywords: string) => void;
  isLoading?: boolean;
  isVerifying?: boolean;
}

export const LinkInput = ({ onSearch, isLoading = false, isVerifying = false }: LinkInputProps) => {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim() && !keywords.trim()) {
      toast({
        title: "Missing Input",
        description: "Please paste a link or enter product keywords",
        variant: "destructive",
      });
      return;
    }

    onSearch(url.trim(), keywords.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast({
        title: "Link Pasted!",
        description: "Ready to find the best deals",
      });
    } catch (err) {
      toast({
        title: "Paste Failed",
        description: "Please paste the link manually",
        variant: "destructive",
      });
    }
  };

  const recentSearches = ProductCache.getRecentSearches(3);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary font-inter">
            TrendBuy
          </h1>
        </div>
        <p className="text-muted-foreground text-lg font-inter">
          Find products from your social posts
        </p>
      </div>

      <Card className="p-6 bg-gradient-card shadow-floating border-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste TikTok, Instagram, or YouTube link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 text-base border-border/50 focus:border-primary transition-smooth font-inter"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="absolute right-2 top-2 h-8 text-xs font-inter"
              >
                Paste
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground font-inter">
              or
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter product keywords..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="pl-10 h-12 text-base border-border/50 focus:border-primary transition-smooth font-inter"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="paste"
            size="lg"
            disabled={isLoading || isVerifying}
            className="w-full h-12 font-inter font-semibold"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Verifying your product...
              </>
            ) : isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Finding Best Deals...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Find Best Deals
              </>
            )}
          </Button>
        </form>
      </Card>

      {recentSearches.length > 0 && (
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground font-inter">Recent Searches</h3>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (search.url) {
                      setUrl(search.url);
                      setKeywords('');
                    } else {
                      setKeywords(search.keywords.join(' '));
                      setUrl('');
                    }
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-smooth"
                >
                  <p className="text-sm text-foreground font-inter">
                    {search.url ? '🔗 Link search' : `🔍 ${search.keywords.join(', ')}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {search.data.products.length} products found
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground font-inter">
        <p>Supports TikTok, Instagram, YouTube & more</p>
      </div>
    </div>
  );
};