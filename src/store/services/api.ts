import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product, CartItem, Order } from '@/lib/db';

// Define a service using a base URL and expected endpoints
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers) => {
            return headers;
        },
    }),
    tagTypes: ['Products', 'Cart', 'Order', 'Stats'],
    endpoints: (builder) => ({
        getProducts: builder.query<{ success: boolean; products: Product[] }, void>({
            query: () => 'products',
            providesTags: ['Products'],
        }),
        getCart: builder.query<{ success: boolean; cart: CartItem[] }, string>({
            query: (userId) => `cart?userId=${userId}`,
            providesTags: ['Cart'],
        }),
        addToCart: builder.mutation<{ success: boolean; cart: CartItem[] }, { userId: string; productId: string; quantity: number }>({
            query: (body) => ({
                url: 'cart',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Cart'],
        }),
        checkout: builder.mutation<{ success: boolean; orderId: string; message: string; rewardCode?: string }, { userId: string; discountCode?: string }>({
            query: (body) => ({
                url: 'checkout',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Cart', 'Order', 'Stats'],
        }),
        validateCode: builder.mutation<{ success: boolean; discountType: 'PERCENTAGE' | 'FIXED'; value: number }, { code: string }>({
            query: (body) => ({
                url: 'validate-code',
                method: 'POST',
                body,
            }),
        }),
        getAdminStats: builder.query<{
            totalItemsPurchased: number;
            totalRevenue: number;
            totalDiscountGiven: number;
            discountCodes: { code: string; isUsed: boolean; value: number; discountType: string }[];
            orderCount: number;
            orders: Order[];
        }, void>({
            query: () => 'admin/stats',
            transformResponse: (response: {
                success: boolean; stats: {
                    totalItemsPurchased: number;
                    totalRevenue: number;
                    totalDiscountGiven: number;
                    discountCodes: { code: string; isUsed: boolean; value: number; discountType: string }[];
                    orderCount: number;
                    orders: Order[];
                }
            }) => response.stats,
            providesTags: ['Stats'],
        }),
        generateDiscountCode: builder.mutation<{ success: boolean; code?: string; message: string }, void>({
            query: () => ({
                url: 'admin/discount',
                method: 'POST',
            }),
            invalidatesTags: ['Stats'],
        }),
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
    useGetProductsQuery,
    useGetCartQuery,
    useAddToCartMutation,
    useCheckoutMutation,
    useValidateCodeMutation,
    useGetAdminStatsQuery,
    useGenerateDiscountCodeMutation
} = api;
