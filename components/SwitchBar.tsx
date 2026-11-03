
import { useState } from "react";

export interface SwitchBarItem<T> {
    key: T;
    label: string;
}

interface SwitchBarProps<T> {
    items?: SwitchBarItem<T>[];
    defaultKey?: T;
    onChange?: (key: T) => void;
}

const SwitchBar = <T,>({
    items = [],
    defaultKey,
    onChange,
}: SwitchBarProps<T>) => {
    const [activeKey, setActiveKey] = useState<T | undefined>(
        defaultKey ?? items[0]?.key
    );

    const handleChange = (key: T) => {
        setActiveKey(key);
        onChange?.(key);
    };

    return (
        <div className="w-full flex items-center border-b border-gray-200">
            {items.map((item) => {
                const isActive = activeKey === item.key;

                return (
                    <button
                        key={String(item.key)}
                        type="button"
                        onClick={() => handleChange(item.key)}
                        className={`
                            flex-1
                            px-4 py-3
                            text-sm font-medium
                            transition-all duration-200
                            border-b-2
                            ${
                                isActive
                                    ? "border-green-600 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }
                        `}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SwitchBar;

