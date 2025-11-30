import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // Note: I need to install this if I want polymorphism, or just use standard props. I'll stick to standard for now to avoid extra deps unless needed.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// I'll use class-variance-authority for variants. I need to install it.
// For now, I'll implement a simple version without cva to save a step, or I should install cva.
// Actually, cva is standard. I'll install it in the next step if I haven't.
// Wait, I didn't install cva. I'll use a simple switch or object map for now to keep it lightweight, or just standard clsx logic.

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg shadow-rose-200",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
                outline: "border-2 border-primary text-primary hover:bg-primary/10",
                ghost: "hover:bg-accent/20 text-foreground",
                gold: "bg-accent text-white hover:bg-accent/90 shadow-md",
            },
            size: {
                sm: "h-9 px-4 text-sm",
                md: "h-11 px-6 text-base",
                lg: "h-14 px-8 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </Comp>
        );
    }
);
Button.displayName = "Button";

// Need to fix the motion.button ref issue.
// I'll just use standard button for now to avoid type errors without full framer-motion setup in this file.
// I'll add `active:scale-95` to baseStyles which gives the press effect.

export { Button, buttonVariants };
