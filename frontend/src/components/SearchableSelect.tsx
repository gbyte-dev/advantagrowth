"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SearchableOption {
    value: string;
    label: string;
    hint?: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SearchableOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    error?: boolean;
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    error,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find((o) => o.value === value);

    const filtered = query.trim()
        ? options.filter(
            (o) =>
                o.value.toLowerCase().includes(query.trim().toLowerCase()) ||
                o.label.toLowerCase().includes(query.trim().toLowerCase())
        )
        : options;

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`box-border flex w-full items-center justify-between rounded-xl border-2 bg-gray-50 px-3 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-all hover:border-gray-400 hover:bg-gray-50/70 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-300"
                    }`}
            >
                <span className="truncate">
                    {selected ? `${selected.label}${selected.hint ? ` (${selected.hint})` : ""}` : placeholder}
                </span>
                <ChevronDown size={15} className="ml-2 shrink-0 text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="relative border-b border-gray-100 p-2">
                        <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoComplete="off"
                            placeholder={searchPlaceholder}
                            className="box-border w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:bg-white"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-400">No results found.</li>
                        )}
                        {filtered.map((o) => (
                            <li key={o.value}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(o.value);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-violet-50 ${o.value === value ? "bg-violet-50 font-semibold text-violet-700" : "text-gray-700"
                                        }`}
                                >
                                    <span className="truncate">{o.label}</span>
                                    {o.hint && <span className="ml-2 shrink-0 text-gray-400">{o.hint}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
