'use client';

import { useGetProductsQuery, useAddToCartMutation } from '@/store/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, toggleCart, setUserId } from '@/store/cartSlice';
import { addToast } from '@/store/toastSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Product } from '@/lib/db';

/**
 * Component that displays a grid of products.
 * Handles fetching product data and manages the user's shopping session.
 */
export default function ProductGrid() {
    const { data, error, isLoading } = useGetProductsQuery();
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
    const dispatch = useAppDispatch();
    const userId = useAppSelector(state => state.cart.userId);

    useEffect(() => {
        // Initialize user session if not present
        let currentUserId = userId;
        if (!currentUserId) {
            // Try local storage first
            const storedId = localStorage.getItem('ecommerce_user_id');
            if (storedId) {
                currentUserId = storedId;
            } else {
                currentUserId = uuidv4();
                localStorage.setItem('ecommerce_user_id', currentUserId);
            }
            dispatch(setUserId(currentUserId));
        }
    }, [dispatch, userId]);

    const handleAddToCart = async (product: Product) => {
        if (!userId) return;

        // 1. Optimistic update (client-side) - Update Redux store immediately
        dispatch(addItem({ productId: product.id, quantity: 1 }));
        dispatch(toggleCart()); // Open cart to show feedback

        // 2. API Call (Server sync)
        try {
            await addToCart({
                userId,
                productId: product.id,
                quantity: 1
            }).unwrap();
            dispatch(addToast({
                type: 'success',
                title: 'Collection Updated',
                message: `${product.name} has been synchronized with your profile.`,
                duration: 3000
            }));
        } catch (err) {
            console.error('Failed to add to cart:', err);
            dispatch(addToast({
                type: 'error',
                title: 'Sync Failed',
                message: 'Could not update your collection. Please try again.',
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">Failed to load products.</div>;
    }

    if (!data?.success || !data.products.length) {
        return <div className="text-center py-10">No products found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
            {data.products.map((product) => (
                <Card key={product.id} className="premium-card flex flex-col h-full overflow-hidden border-0 bg-transparent group">
                    <div className="relative h-64 w-full overflow-hidden bg-slate-800 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-slate-700 absolute opacity-50" />
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 z-10"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-20" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 z-30">
                            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-widest uppercase">
                                View Details
                            </Badge>
                        </div>
                    </div>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-bold tracking-tight">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-muted-foreground/80">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end pt-0">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <p className="text-3xl font-black text-primary">${product.price.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-white/5 bg-white/5">
                        <Button
                            className="w-full h-12 rounded-xl transition-all hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Collections
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
