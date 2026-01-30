'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCart, removeItem, updateQuantity, applyDiscount, clearCart } from '@/store/cartSlice';
import { addToast } from '@/store/toastSlice';
import { useGetCartQuery, useAddToCartMutation, useValidateCodeMutation } from '@/store/services/api';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, Minus, Plus, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useGetProductsQuery } from '@/store/services/api';
import Image from 'next/image';
import { calculateDiscount } from '@/lib/discount';

// Simple Sheet implementation for now since we didn't add it to UI library yet
// Actually, let's create a SlideOver manually or use a simple fixed div for speed as "Sheet" suggests shadcn/ui component
// typically needs more setup. A standard fixed overlay is easier.

/**
 * The shopping cart drawer component.
 * Manages item display, quantity updates, discount code application, and the checkout process.
 * Synchronizes local Redux state with the server-side cart.
 */
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
                dispatch(applyDiscount({ code: promoCode, type: res.discountType, value: res.value }));
                dispatch(addToast({
                    type: 'success',
                    title: 'Matrix Verified',
                    message: `Discount policy "${promoCode}" successfully decrypted.`,
                }));
            } else {
                dispatch(addToast({
                    type: 'error',
                    title: 'Invalid Matrix',
                    message: 'The provided promo code does not exist in our active archives.',
                }));
            }
        } catch (error) {
            console.error('Validation error:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Link Interrupted',
                message: 'A disturbance in the synchronization prevented code validation.',
            }));
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
            const data: { success: boolean; message: string; rewardCode?: string } = await res.json();
            if (data.success) {
                if (data.rewardCode) {
                    dispatch(addToast({
                        type: 'reward',
                        title: 'Golden Reward Unlocked!',
                        message: `Stunning! Your order triggered a premium reward. Use code ${data.rewardCode} on your next visit!`,
                        duration: 8000
                    }));
                } else {
                    dispatch(addToast({
                        type: 'success',
                        title: 'Order Synchronized',
                        message: 'Your premium selection is now being processed. Check your email for confirmation.',
                    }));
                }
                dispatch(clearCart());
                dispatch(toggleCart());

                // Allow user to see the toast before reload if they want, 
                // but since we clear state and close drawer, usually they stay on page.
                // If we want to reload, we should delay it.
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                dispatch(addToast({
                    type: 'error',
                    title: 'Sync Interrupted',
                    message: data.message || 'We encountered a momentary disturbance in the digital flow. Please try again.',
                }));
            }
        } catch {
            dispatch(addToast({
                type: 'error',
                title: 'Checkout Error',
                message: 'An unexpected error occurred during checkout. Please try again.',
            }));
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
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={() => dispatch(toggleCart())}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md glass border-l border-white/10 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Your Collections</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Premium Curation</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => dispatch(toggleCart())}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-muted/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground font-medium">Your cart is feeling light.</p>
                            <Button variant="link" onClick={() => dispatch(toggleCart())} className="mt-2 text-primary">Explorer Store →</Button>
                        </div>
                    ) : (
                        cartItems.map(item => {
                            const product = productData?.products.find(p => p.id === item.productId);
                            if (!product) return null;

                            return (
                                <div key={item.productId} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-colors">
                                    <div className="h-24 w-24 relative rounded-xl overflow-hidden bg-muted shrink-0 shadow-inner">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">${product.price.toFixed(2)}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center bg-background/50 rounded-lg p-1 border border-white/5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md hover:bg-white/10"
                                                    onClick={() => handleUpdateQty(item.productId, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md hover:bg-white/10"
                                                    onClick={() => handleUpdateQty(item.productId, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => handleUpdateQty(item.productId, -item.quantity)}
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

                <div className="border-t border-white/10 p-6 bg-white/5 space-y-4">
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                placeholder="Enter PROMO Code"
                                className="flex h-11 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button
                                onClick={handleApplyCoupon}
                                disabled={!promoCode || isValidating}
                                className="h-11 px-6 rounded-xl hover:shadow-lg active:scale-95 transition-all"
                            >
                                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                        {discountCode && (
                            <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20">
                                <Tag className="h-3 w-3" />
                                Code &quot;{discountCode}&quot; successfully applied!
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="text-foreground">${totalAmount.toFixed(2)}</span>
                        </div>
                        {finalTotal < totalAmount && (
                            <div className="flex justify-between items-center text-sm font-bold text-green-400">
                                <span className="flex items-center gap-1">Exclusive Discount <Tag className="h-3 w-3" /></span>
                                <span>-${(totalAmount - finalTotal).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                            <span className="text-lg font-bold">Estimated Total</span>
                            <span className="text-2xl font-black text-primary tracking-tight">${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
                        size="lg"
                        disabled={cartItems.length === 0 || checkoutLoading}
                        onClick={handleCheckout}
                    >
                        {checkoutLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">Complete Purchase <ChevronRight className="h-5 w-5" /> </span>
                        )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium opacity-50">Secure Encryption & Guaranteed Delivery</p>
                </div>
            </div>
        </div>
    );
}
