'use client';

import Link from 'next/link';
import { ShoppingCart, ShoppingBag, Tag } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleCart } from '@/store/cartSlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { useGetAdminStatsQuery } from '@/store/services/api';

/**
 * Main navigation bar component.
 * Provides links to the storefront and admin dashboard, 
 * and displays the shopping cart toggle with an item count badge.
 */
export default function Navbar() {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);
    const { data: stats } = useGetAdminStatsQuery();

    // Use local state to avoid hydration mismatch for the badge count
    const [mounted, setMounted] = useState(false);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const activeCodes = stats?.discountCodes.filter(c => !c.isUsed) || [];

    useEffect(() => {
        // Just to trigger a re-render on mount
        setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    }, [dispatch]);

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gradient">QuickEcom</span>
                    </Link>
                    <nav className="ml-10 hidden md:flex gap-8">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Storefront
                        </Link>
                        <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl group cursor-help relative animate-in fade-in duration-500">
                        <Tag className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">
                            {activeCodes.length > 0 ? `${activeCodes.length} Rewards Active` : 'Loyalty Rewards'}
                        </span>

                        <div className="absolute top-full right-0 mt-2 w-64 glass p-4 rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-muted-foreground">Available Rewards</h4>
                            <div className="space-y-2">
                                {activeCodes.length > 0 ? (
                                    activeCodes.slice(0, 2).map(code => (
                                        <div key={code.code} className="p-2 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-muted-foreground mb-1 uppercase">Active Coupon:</p>
                                            <code className="text-sm font-black text-primary block text-center py-1 bg-primary/10 rounded-lg border border-primary/20 select-all cursor-copy">
                                                {code.code}
                                            </code>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-2">
                                        <p className="text-[10px] text-muted-foreground">Complete 3 orders to trigger a new reward!</p>
                                    </div>
                                )}
                                <Link href="/admin" className="block text-center pt-2">
                                    <span className="text-[9px] text-primary hover:underline font-bold uppercase tracking-widest">Manage Dashboard &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="relative rounded-xl border-white/10 hover:bg-white/5"
                        onClick={() => dispatch(toggleCart())}
                        aria-label="Open cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {mounted && itemCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-background"
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
