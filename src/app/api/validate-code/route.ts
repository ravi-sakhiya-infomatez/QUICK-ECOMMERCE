import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db';

/**
 * Validates a discount code.
 * Checks if the code exists in the store and has not been used.
 * 
 * @param req The NextRequest object containing the code to validate.
 * @returns JSON response with discount details if valid.
 */
export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ success: false, message: 'Code is required' }, { status: 400 });
        }

        const discount = store.discountCodes.find(c => c.code === code && !c.isUsed);

        if (discount) {
            return NextResponse.json({
                success: true,
                discountType: discount.discountType,
                value: discount.value
            });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid or expired code' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, message: 'Error validating code' }, { status: 500 });
    }
}
