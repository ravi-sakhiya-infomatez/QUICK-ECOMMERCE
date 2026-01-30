'use client';

import { useGetProductsQuery, useAddToCartMutation } from '@/store/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, toggleCart, setUserId } from '@/store/cartSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Product } from '@/lib/db';

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
        } catch (err) {
            console.error('Failed to add to cart:', err);
            // In a real app, we might revert the optimistic update here
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {data.products.map((product) => (
                <Card key={product.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full bg-muted">
                        {/* Using a placeholder for dummy images if remote not allowed in Next config yet, 
                 but assuming standard setup allows basic fetching or we'll get nice error/fallback.
                 Ideally we need to configure next.config.ts for remote images.
             */}
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={isAdding}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
