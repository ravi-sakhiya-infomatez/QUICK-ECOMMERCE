import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './cartSlice';
import { adminSlice } from './adminSlice';
import { api } from './services/api';

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartSlice.reducer,
            admin: adminSlice.reducer,
            [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
    });
};

// Types for RootState and AppDispatch based on the store instance
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
