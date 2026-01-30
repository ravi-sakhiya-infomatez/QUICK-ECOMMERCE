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

export const isNthOrder = (orderCount: number, n: number): boolean => {
    return orderCount > 0 && orderCount % n === 0;
};
