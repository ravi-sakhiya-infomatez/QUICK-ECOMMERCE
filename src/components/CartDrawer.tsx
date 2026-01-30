'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCart, removeItem, updateQuantity, applyDiscount } from '@/store/cartSlice';
import { useGetCartQuery, useAddToCartMutation, useValidateCodeMutation } from '@/store/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetProductsQuery } from '@/store/services/api';
import Image from 'next/image';
import { calculateDiscount } from '@/lib/discount';

// Simple Sheet implementation for now since we didn't add it to UI library yet
// Actually, let's create a SlideOver manually or use a simple fixed div for speed as "Sheet" suggests shadcn/ui component
// typically needs more setup. A standard fixed overlay is easier.

export default function CartDrawer() {
    const dispatch = useAppDispatch();
    const { isOpen, userId, items: localItems } = useAppSelector((state) => state.cart);

    // Fetch cart from server to ensure sync, but rely on localItems for UI speed
    const { refetch } = useGetCartQuery(userId || '', { skip: !userId });
    const [validateCode, { isLoading: isValidating }] = useValidateCodeMutation();
    const { discountCode, discountValue, discountType } = useAppSelector((state) => state.cart);

    // Sync server cart to local if needed, OR just use local as truth for UI
    // Real-world: merge strategies. Here: we trust local + background sync.
    const { data: productData } = useGetProductsQuery();
    const [addToCart] = useAddToCartMutation();

    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [promoCode, setPromoCode] = useState('');

    const cartItems = localItems; // Use local Redux state for immediate feedback using optimistic updates

    // ... inside the component ...

    const totalAmount = cartItems.reduce((acc, item) => {
        const product = productData?.products.find(p => p.id === item.productId);
        return acc + (product?.price || 0) * item.quantity;
    }, 0);

    const finalTotal = calculateDiscount(totalAmount, discountType, discountValue);

    const handleApplyCoupon = async () => {
        if (!promoCode) return;
        try {
            const res = await validateCode({ code: promoCode }).unwrap();
            if (res.success) {
                dispatch(applyDiscount({
                    code: promoCode,
                    type: res.discountType,
                    value: res.value
                }));
                // alert('Coupon Applied!');
            }
        } catch {
            alert('Invalid Code');
        }
    };

    const handleUpdateQty = async (productId: string, delta: number) => {
        if (!userId) return;
        const item = cartItems.find(i => i.productId === productId);
        if (!item) return;

        const newQty = item.quantity + delta;

        // Optimistic
        if (newQty <= 0) {
            dispatch(removeItem(productId));
        } else {
            dispatch(updateQuantity({ productId, quantity: newQty }));
        }

        // Server
        try {
            await addToCart({ userId, productId, quantity: delta }).unwrap();
            refetch();
        } catch {
            console.error("Failed to update cart");
            // Revert logic would go here
        }
    };

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            // API call
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, discountCode })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Order Placed! ${data.rewardCode ? `\nYour Reward Code: ${data.rewardCode}` : ''}`);
                window.location.reload(); // Simple reset
            } else {
                alert('Checkout failed: ' + data.message);
            }
        } catch {
            alert('Checkout error');
        } finally {
            setCheckoutLoading(false);
            dispatch(toggleCart());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => dispatch(toggleCart())}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Shopping Cart</h2>
                    <Button variant="ghost" size="icon" onClick={() => dispatch(toggleCart())}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            Your cart is empty.
                        </div>
                    ) : (
                        cartItems.map(item => {
                            const product = productData?.products.find(p => p.id === item.productId);
                            if (!product) return null;

                            return (
                                <div key={item.productId} className="flex gap-4 border-b pb-4 last:border-0">
                                    <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted shrink-0">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleUpdateQty(item.productId, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleUpdateQty(item.productId, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 ml-auto text-destructive hover:text-destructive"
                                                onClick={() => handleUpdateQty(item.productId, -item.quantity)} // Remove all
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t p-4 bg-muted/20">
                    <div className="mb-4 space-y-2">
                        <div className="flex gap-2">
                            <input
                                placeholder="Discount Code"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button onClick={handleApplyCoupon} disabled={!promoCode || isValidating} variant="outline">
                                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                        {discountCode && (
                            <div className="text-sm text-green-600 font-medium">
                                Code &quot;{discountCode}&quot; applied!
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    {finalTotal < totalAmount && (
                        <div className="flex justify-between items-center mb-2 text-green-600">
                            <span className="font-medium">Discount</span>
                            <span>-${(totalAmount - finalTotal).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" size="lg" disabled={cartItems.length === 0 || checkoutLoading} onClick={handleCheckout}>
                        {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}
