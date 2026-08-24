import { ReactNode } from "react";

export default function FormSectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="mb-5 flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                {icon}
            </span>
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>
    );
}
