import { NextResponse } from 'next/server';
import { store } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
    try {
        // Check if the current order count is a multiple of n
        // Note: In a real scenario, this logic might be triggered after a purchase.
        // However, if we want to manually generate or check if the *next* order will be lucky or the *current* count IS lucky
        // Let's assume it checks the *current* state.

        // BUT, since we increment orderCount on checkout, let's implement the logic requested:
        // "Check if orderCount % n === 0. If yes, generate... If no, return error."

        if (store.orderCount > 0 && store.orderCount % store.n === 0) {
            const uniqueCode = `LUCKY-${uuidv4().substring(0, 8).toUpperCase()}`;

            store.discountCodes.push({
                code: uniqueCode,
                discountType: 'FIXED', // Let's give a fixed amount this time for variety
                value: 50,
                isUsed: false,
            });

            return NextResponse.json({
                success: true,
                message: 'Discount code generated successfully',
                code: uniqueCode
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Condition not met (Order count is not a multiple of n)',
                currentCount: store.orderCount,
                n: store.n
            }, { status: 400 });
        }
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json({
            success: false,
            message: 'Failed to generate discount code'
        }, { status: 500 });
    }
}
