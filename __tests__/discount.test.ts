import { calculateDiscount, isNthOrder } from '../src/lib/discount';

describe('Discount Logic', () => {
    describe('calculateDiscount', () => {
        it('should return total amount if no discount type or value is provided', () => {
            expect(calculateDiscount(100)).toBe(100);
            expect(calculateDiscount(100, undefined, 10)).toBe(100);
            expect(calculateDiscount(100, 'PERCENTAGE', undefined)).toBe(100);
        });

        it('should correctly calculate percentage discount', () => {
            expect(calculateDiscount(100, 'PERCENTAGE', 10)).toBe(90);
            expect(calculateDiscount(200, 'PERCENTAGE', 50)).toBe(100);
            expect(calculateDiscount(100, 'PERCENTAGE', 100)).toBe(0);
        });

        it('should correctly calculate fixed discount', () => {
            expect(calculateDiscount(100, 'FIXED', 10)).toBe(90);
            expect(calculateDiscount(50, 'FIXED', 20)).toBe(30);
        });

        it('should return 0 if fixed discount is greater than total', () => {
            expect(calculateDiscount(50, 'FIXED', 60)).toBe(0);
        });
    });

    describe('isNthOrder', () => {
        it('should return true if order count is a multiple of n', () => {
            expect(isNthOrder(3, 3)).toBe(true);
            expect(isNthOrder(6, 3)).toBe(true);
            expect(isNthOrder(10, 5)).toBe(true);
        });

        it('should return false if order count is not a multiple of n', () => {
            expect(isNthOrder(1, 3)).toBe(false);
            expect(isNthOrder(2, 3)).toBe(false);
            expect(isNthOrder(4, 3)).toBe(false);
        });

        it('should return false if order count is 0', () => {
            expect(isNthOrder(0, 3)).toBe(false);
        });
    });
});
