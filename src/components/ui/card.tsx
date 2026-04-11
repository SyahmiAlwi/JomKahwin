import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "songket" | "glass" | "gradient";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-shadow duration-300",
            songket: "bg-card text-card-foreground border border-rose-200 relative overflow-hidden shadow-rose-sm",
            glass: "glass shadow-md hover:shadow-lg transition-all duration-300",
            gradient: "bg-hero-gradient border-none text-white shadow-rose-lg",
        };

        return (
            <div
                ref={ref}
                className={cn("rounded-2xl", variants[variant], className)}
                {...props}
            >
                {variant === "songket" && (
                    <>
                        <div className="absolute top-0 right-0 w-28 h-28 bg-batik-pattern opacity-100 pointer-events-none -mr-8 -mt-8 rotate-12" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-batik-pattern opacity-70 pointer-events-none -ml-6 -mb-6 -rotate-12" />
                    </>
                )}
                {props.children}
            </div>
        );
    }
);
Card.displayName = "Card";

export { Card };
