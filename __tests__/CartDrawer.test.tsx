import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartDrawer from '../src/components/CartDrawer';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import {
    useGetCartQuery,
    useAddToCartMutation,
    useValidateCodeMutation,
    useGetProductsQuery
} from '../src/store/services/api';
import { toggleCart } from '../src/store/cartSlice';

// Mock child components or libraries
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}));

jest.mock('lucide-react', () => ({
    ShoppingCart: () => <div data-testid="icon-shopping-cart" />,
    X: () => <div data-testid="icon-x" />,
    Minus: () => <div data-testid="icon-minus" />,
    Plus: () => <div data-testid="icon-plus" />,
    Trash2: () => <div data-testid="icon-trash" />,
    Loader2: () => <div data-testid="icon-loader" />
}));

// Mock Redux Hooks
jest.mock('../src/store/hooks');

// Mock API Hooks
jest.mock('../src/store/services/api');

// Mock Actions
jest.mock('../src/store/cartSlice', () => ({
    toggleCart: jest.fn(() => ({ type: 'cart/toggleCart' })),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    applyDiscount: jest.fn()
}));

const mockDispatch = jest.fn();

describe('CartDrawer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

        // Default API mocks
        (useGetCartQuery as jest.Mock).mockReturnValue({ data: null, refetch: jest.fn() });
        (useGetProductsQuery as jest.Mock).mockReturnValue({ data: { success: true, products: [] } });
        (useAddToCartMutation as jest.Mock).mockReturnValue([jest.fn()]);
        (useValidateCodeMutation as jest.Mock).mockReturnValue([jest.fn(), { isLoading: false }]);
    });

    it('should not render if isOpen is false', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isOpen: false,
            userId: 'user-1',
            items: [],
            discountCode: null,
            discountValue: 0,
            discountType: null
        });

        const { container } = render(<CartDrawer />);
        expect(container.firstChild).toBeNull();
    });

    it('should display empty cart message when no items', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isOpen: true,
            userId: 'user-1',
            items: [],
            discountCode: null,
            discountValue: 0,
            discountType: null
        });

        render(<CartDrawer />);
        expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    it('should display items and correct totals', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isOpen: true,
            userId: 'user-1',
            items: [{ productId: 'p1', quantity: 2 }],
            discountCode: null,
            discountValue: 0,
            discountType: null
        });

        (useGetProductsQuery as jest.Mock).mockReturnValue({
            data: {
                success: true,
                products: [
                    { id: 'p1', name: 'Product 1', price: 10, imageUrl: '/p1.jpg', description: 'Desc 1' }
                ]
            }
        });

        render(<CartDrawer />);

        expect(screen.getByText('Product 1')).toBeInTheDocument();
        // Check unit price
        expect(screen.getByText('$10.00')).toBeInTheDocument();
        // Check quantity
        expect(screen.getByText('2')).toBeInTheDocument();

        // Total amount (Subtotal and Total should be same when no discount)
        const totalElements = screen.getAllByText('$20.00');
        expect(totalElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should calculate discount correctly in the UI', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isOpen: true,
            userId: 'user-1',
            items: [{ productId: 'p1', quantity: 2 }],
            discountCode: 'SAVE10',
            discountValue: 10,
            discountType: 'PERCENTAGE'
        });

        (useGetProductsQuery as jest.Mock).mockReturnValue({
            data: {
                success: true,
                products: [
                    { id: 'p1', name: 'Product 1', price: 10, imageUrl: '/p1.jpg', description: 'Desc 1' }
                ]
            }
        });

        render(<CartDrawer />);

        // Subtotal: 20, Discount: 10% of 20 = 2, Total: 18
        expect(screen.getByText('$20.00')).toBeInTheDocument(); // Subtotal
        expect(screen.getByText('-$2.00')).toBeInTheDocument(); // Discount amount
        expect(screen.getByText('$18.00')).toBeInTheDocument(); // Final Total
    });

    it('should call dispatch(toggleCart) when clicking close button', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            isOpen: true,
            userId: 'user-1',
            items: [],
            discountCode: null,
            discountValue: 0,
            discountType: null
        });

        render(<CartDrawer />);

        // X icon has data-testid="icon-x"
        const closeIcon = screen.getByTestId('icon-x');
        const closeButton = closeIcon.closest('button');
        if (closeButton) {
            fireEvent.click(closeButton);
        }

        expect(mockDispatch).toHaveBeenCalledWith(toggleCart());
    });
});
