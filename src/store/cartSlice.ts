
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/lib/db';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    userId: string | null;
    discountCode?: string;
    discountValue?: number;
    discountType?: 'PERCENTAGE' | 'FIXED';
}

const initialState: CartState = {
    items: [],
    isOpen: false,
    userId: null,
    discountCode: undefined,
    discountValue: undefined,
    discountType: undefined,
};

/**
 * Redux slice for managing the shopping cart state.
 */
export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /** Toggles the visibility of the cart drawer. */
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        /** Adds an item to the cart or increments quantity if it exists. */
        addItem: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(item => item.productId === action.payload.productId);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        /** Removes an item from the cart by its product ID. */
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.productId !== action.payload);
        },
        /** Updates the quantity of a specific item in the cart. */
        updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const item = state.items.find(item => item.productId === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        /** Clears all items from the cart. */
        clearCart: (state) => {
            state.items = [];
        },
        /** Sets the current user ID for the shopping session. */
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        /** Applies a discount code to the current cart. */
        applyDiscount: (state, action: PayloadAction<{ code: string; type: 'PERCENTAGE' | 'FIXED'; value: number }>) => {
            state.discountCode = action.payload.code;
            state.discountType = action.payload.type;
            state.discountValue = action.payload.value;
        }
    },
});

export const { toggleCart, addItem, removeItem, updateQuantity, clearCart, setUserId, applyDiscount } = cartSlice.actions;
export default cartSlice.reducer;
