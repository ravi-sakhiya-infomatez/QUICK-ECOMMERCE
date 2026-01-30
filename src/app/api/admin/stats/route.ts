import { NextResponse } from 'next/server';
import { store } from '@/lib/db';

/**
 * Retrieves aggregate statistics for the admin dashboard.
 * Includes total items purchased, total revenue, and total discounts given.
 * 
 * @returns JSON response with shop statistics.
 */
export async function GET() {
    const totalItemsPurchased = store.orders.reduce((acc, order) => {
        return acc + order.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0);
    }, 0);

    const totalRevenue = store.orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // discountAmount was just added to the Order interface
    const totalDiscountGiven = store.orders.reduce((acc, order) => acc + (order.discountAmount || 0), 0);

    const discountCodes = store.discountCodes.map(c => ({
        code: c.code,
        isUsed: c.isUsed
    }));

    return NextResponse.json({
        success: true,
        stats: {
            totalItemsPurchased,
            totalRevenue,
            totalDiscountGiven,
            discountCodes,
            orderCount: store.orderCount,
            orders: store.orders // Expose orders for history view
        }
    });
}
