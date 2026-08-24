"use client";

import SearchableSelect from "@/components/SearchableSelect";

export const ALL_TIMEZONES: string[] = (() => {
    try {
        return Intl.supportedValuesOf("timeZone");
    } catch {
        return ["UTC"];
    }
})();

const TIMEZONE_OPTIONS = ALL_TIMEZONES.map((tz) => ({
    value: tz,
    label: tz.replace(/_/g, " "),
}));

interface TimezoneSelectProps {
    value: string;
    onChange: (tz: string) => void;
    error?: boolean;
}

export default function TimezoneSelect({ value, onChange, error }: TimezoneSelectProps) {
    return (
        <SearchableSelect
            value={value}
            onChange={onChange}
            options={TIMEZONE_OPTIONS}
            placeholder="Select timezone"
            searchPlaceholder="Search timezone..."
            error={error}
        />
    );
}
