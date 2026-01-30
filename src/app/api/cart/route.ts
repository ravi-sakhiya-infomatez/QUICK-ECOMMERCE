import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userId, productId, quantity } = await req.json();

        if (!userId || !productId || typeof quantity !== 'number') {
            return NextResponse.json({
                success: false,
                message: 'Missing userId, productId, or quantity'
            }, { status: 400 });
        }

        const product = store.products.find(p => p.id === productId);
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        const userCart = store.cart.get(userId) || [];

        const existingItemIndex = userCart.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less (though frontend should probably handle removal explicitly)
                userCart.splice(existingItemIndex, 1);
            } else {
                userCart[existingItemIndex].quantity += quantity;
            }
        } else {
            if (quantity > 0) {
                userCart.push({ productId, quantity });
            }
        }

        store.cart.set(userId, userCart);

        return NextResponse.json({
            success: true,
            cart: userCart
        });
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Invalid request body'
        }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: 'Missing userId query parameter'
        }, { status: 400 });
    }

    const userCart = store.cart.get(userId) || [];

    return NextResponse.json({
        success: true,
        cart: userCart
    });
}
