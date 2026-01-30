import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles the checkout process.
 * Calculates total, validates discount code, creates order, and checks for Nth order rewards.
 * 
 * @param req The NextRequest object containing userId and optional discountCode.
 * @returns JSON response with order details and any generated reward code.
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, discountCode } = await req.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Missing userId'
            }, { status: 400 });
        }

        const userCart = store.cart.get(userId);

        if (!userCart || userCart.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Cart is empty'
            }, { status: 400 });
        }

        // Calculate total
        let totalAmount = 0;
        for (const item of userCart) {
            const product = store.products.find(p => p.id === item.productId);
            if (product) {
                totalAmount += product.price * item.quantity;
            }
        }

        // Validate discount code
        let discount = 0;
        let appliedCode = undefined;

        if (discountCode) {
            const codeIndex = store.discountCodes.findIndex(c => c.code === discountCode && !c.isUsed);
            if (codeIndex !== -1) {
                const code = store.discountCodes[codeIndex];
                if (code.discountType === 'PERCENTAGE') {
                    discount = totalAmount * (code.value / 100);
                } else {
                    discount = code.value;
                }
                // Mark code as used (single use)
                store.discountCodes[codeIndex].isUsed = true;
                appliedCode = discountCode;
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid or expired discount code'
                }, { status: 400 });
            }
        }

        const finalAmount = Math.max(0, totalAmount - discount);

        // Create Order
        const newOrder = {
            id: uuidv4(),
            userId,
            items: [...userCart],
            totalAmount: finalAmount,
            discountAmount: discount,
            discountCode: appliedCode,
            createdAt: new Date(),
        };

        store.orders.push(newOrder);

        // Increment global order count
        store.orderCount++;

        // Check for Nth order reward
        let rewardCode = null;
        if (store.orderCount % store.n === 0) {
            rewardCode = `DISCOUNT-${uuidv4().substring(0, 8).toUpperCase()}`;
            store.discountCodes.push({
                code: rewardCode,
                discountType: 'PERCENTAGE', // Simple 10% off
                value: 10,
                isUsed: false,
            });
        }

        // Clear cart
        store.cart.set(userId, []);

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            message: 'Order placed successfully',
            rewardCode: rewardCode, // Client should show this if present
        });

    } catch {
        return NextResponse.json({
            success: false,
            message: 'Processing failed'
        }, { status: 500 });
    }
}
