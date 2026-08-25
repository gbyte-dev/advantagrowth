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

const CURRENCY_ICONS: Record<string, string> = {
    USD: "fa-dollar-sign",
    EUR: "fa-euro-sign",
    GBP: "fa-pound-sign",
    INR: "fa-indian-rupee-sign",
    JPY: "fa-yen-sign",
    CNY: "fa-yen-sign",
    RUB: "fa-ruble-sign",
    KRW: "fa-won-sign",
    ILS: "fa-shekel-sign",
    NGN: "fa-naira-sign",
    TRY: "fa-turkish-lira-sign",
    BTC: "fa-bitcoin-sign",
};

export const getCurrencyIcon = (currency: string) => CURRENCY_ICONS[currency] || "fa-money-bill-wave";

export const getCurrencySymbol = (currency: string) => {
    if (CURRENCY_SYMBOLS[currency]) return CURRENCY_SYMBOLS[currency];
    try {
        const parts = new Intl.NumberFormat("en", { style: "currency", currency }).formatToParts(1);
        return parts.find((p) => p.type === "currency")?.value || currency;
    } catch {
        return currency;
    }
};
