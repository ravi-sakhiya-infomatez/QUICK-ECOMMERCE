'use client';

import Link from 'next/link';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleCart } from '@/store/cartSlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);

    // Use local state to avoid hydration mismatch for the badge count
    const [mounted, setMounted] = useState(false);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        // Just to trigger a re-render on mount
        setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    }, [dispatch]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <ShoppingBag className="h-6 w-6" />
                        <span>QuickEcom</span>
                    </Link>
                    <nav className="ml-6 hidden md:flex gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Products
                        </Link>
                        <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                            Admin
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Nav would go here if implemented specifically */}

                    <Button
                        variant="outline"
                        size="icon"
                        className="relative"
                        onClick={() => dispatch(toggleCart())}
                        aria-label="Open cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {mounted && itemCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                            >
                                {itemCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
}
