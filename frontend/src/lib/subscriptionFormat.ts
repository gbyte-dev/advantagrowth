export const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    INR: "₹",
};

export const formatPrice = (price: string | number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
    return `${symbol}${Number(price || 0).toFixed(2)}`;
};

export const formatBilling = (interval: string, intervalCount: number) => {
    if (intervalCount <= 1) return `per ${interval}`;
    return `every ${intervalCount} ${interval}s`;
};
