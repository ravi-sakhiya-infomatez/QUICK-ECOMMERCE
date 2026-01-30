import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 px-6">Featured Products</h1>
        <ProductGrid />
      </main>
      <CartDrawer />
    </div>
  );
}
