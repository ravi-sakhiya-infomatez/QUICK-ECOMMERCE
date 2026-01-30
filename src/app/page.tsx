import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";
import { Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-6">
        {/* Promotional Banner */}
        <div className="mb-10 p-6 glass rounded-3xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Tag className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Flash Loyalty Discount! ⚡</h2>
              <p className="text-sm text-muted-foreground max-w-md">Every <span className="text-primary font-bold">3rd order placed globally</span> triggers a high-value discount code. Don&apos;t miss out!</p>
            </div>
          </div>
          <Link href="/admin" className="relative z-10">
            <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/10 transition-all font-bold">
              View Global Stats &rarr;
            </Button>
          </Link>
        </div>

        <div className="mb-12 border-l-4 border-primary pl-6">
          <h1 className="text-5xl font-black tracking-tighter text-gradient leading-tight">THE PREMIUM<br />COLLECTION</h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">Discover our hand-picked selection of high-performance tech and luxury lifestyle accessories.</p>
        </div>
        <ProductGrid />
      </main>
      <CartDrawer />
    </div>
  );
}
