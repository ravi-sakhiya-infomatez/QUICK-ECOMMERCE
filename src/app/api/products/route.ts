import { NextResponse } from 'next/server';
import { store } from '@/lib/db';

export async function GET() {
    return NextResponse.json({
        success: true,
        products: store.products
    });
}
