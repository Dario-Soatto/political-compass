import TwitterScraper from '@/components/features/TwitterScraper';

export default function CompassPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        
        <TwitterScraper />
      </div>
    </div>
  );
}