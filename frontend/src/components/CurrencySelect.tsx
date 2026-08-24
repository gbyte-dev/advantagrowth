"use client";

import SearchableSelect from "@/components/SearchableSelect";

export interface CurrencyOption {
    code: string;
    name: string;
    symbol: string;
}

export const ALL_CURRENCIES: CurrencyOption[] = (() => {
    try {
        const codes = Intl.supportedValuesOf("currency");
        const names = new Intl.DisplayNames(["en"], { type: "currency" });
        return codes.map((code) => {
            let symbol = code;
            try {
                const parts = new Intl.NumberFormat("en", { style: "currency", currency: code }).formatToParts(1);
                symbol = parts.find((p) => p.type === "currency")?.value || code;
            } catch {
                symbol = code;
            }
            return { code, name: names.of(code) || code, symbol };
        });
    } catch {
        return [
            { code: "EUR", name: "Euro", symbol: "€" },
            { code: "USD", name: "US Dollar", symbol: "$" },
            { code: "GBP", name: "British Pound", symbol: "£" },
            { code: "INR", name: "Indian Rupee", symbol: "₹" },
        ];
    }
})();

const CURRENCY_OPTIONS = ALL_CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
    hint: c.symbol,
}));

interface CurrencySelectProps {
    value: string;
    onChange: (code: string) => void;
    error?: boolean;
}

export default function CurrencySelect({ value, onChange, error }: CurrencySelectProps) {
    return (
        <SearchableSelect
            value={value}
            onChange={onChange}
            options={CURRENCY_OPTIONS}
            placeholder="Select currency"
            searchPlaceholder="Search currency..."
            error={error}
        />
    );
}
