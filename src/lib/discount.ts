/**
 * Calculates the final price after applying a discount.
 * 
 * @param totalAmount The original price before discount.
 * @param discountType The type of discount: 'PERCENTAGE' or 'FIXED'.
 * @param discountValue The numeric value of the discount.
 * @returns The final amount after discount.
 */
export const calculateDiscount = (
    totalAmount: number,
    discountType?: 'PERCENTAGE' | 'FIXED',
    discountValue?: number
): number => {
    if (!discountType || !discountValue) {
        return totalAmount;
    }

    if (discountType === 'PERCENTAGE') {
        return totalAmount - (totalAmount * discountValue / 100);
    } else if (discountType === 'FIXED') {
        return Math.max(0, totalAmount - discountValue);
    }

    return totalAmount;
};

/**
 * Determines if an order count meets the 'nth order' criteria for a discount.
 * 
 * @param orderCount Current total order count.
 * @param n The interval at which discounts are generated (e.g., every 3rd order).
 * @returns True if the order qualifies for a discount reward.
 */
export const isNthOrder = (orderCount: number, n: number): boolean => {
    return orderCount > 0 && orderCount % n === 0;
};
