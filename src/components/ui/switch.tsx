"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(defaultChecked || false);

        const toggle = () => {
            if (disabled) return;
            const newValue = !isChecked;
            setIsChecked(newValue);
            onCheckedChange?.(newValue);
        };

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked);
            }
        }, [checked]);

        return (
            <div
                className={cn(
                    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked ? "bg-primary" : "bg-input",
                    className
                )}
                onClick={toggle}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    ref={ref}
                    checked={isChecked}
                    onChange={(e) => {
                        // Handled by div onClick to allow custom styling easily
                        // but we keep input for form submission if needed
                        onCheckedChange?.(e.target.checked);
                    }}
                    disabled={disabled}
                    {...props}
                />
                <div
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        isChecked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </div>
        );
    }
);
Switch.displayName = "Switch";

export { Switch };
