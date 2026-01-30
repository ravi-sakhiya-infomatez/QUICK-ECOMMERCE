import { createSlice } from '@reduxjs/toolkit';

interface AdminState {
    orderStats: {
        totalOrders: number;
        totalRevenue: number;
    };
}

const initialState: AdminState = {
    orderStats: {
        totalOrders: 0,
        totalRevenue: 0,
    },
};

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Basic placeholder reducers
        updateStats: (state, action) => {
            state.orderStats = action.payload;
        }
    },
});

export const { updateStats } = adminSlice.actions;
export default adminSlice.reducer;
