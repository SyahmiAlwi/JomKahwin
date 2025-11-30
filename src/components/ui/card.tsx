import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "songket" | "glass" | "gradient";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-card text-card-foreground border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300",
            songket: "bg-card text-card-foreground border-2 border-rose-200 relative overflow-hidden shadow-lg shadow-rose-100",
            glass: "glass shadow-xl shadow-rose-500/5 hover:shadow-rose-500/10 transition-all duration-300",
            gradient: "bg-gradient-to-br from-primary to-accent border-none shadow-lg",
        };

        return (
            <div
                ref={ref}
                className={cn("rounded-2xl p-6", variants[variant], className)}
                {...props}
            >
                {variant === "songket" && (
                    <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-batik-pattern opacity-20 pointer-events-none -mr-10 -mt-10 rotate-12" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-batik-pattern opacity-10 pointer-events-none -ml-8 -mb-8 -rotate-12" />
                    </>
                )}
                {props.children}
            </div>
        );
    }
);
Card.displayName = "Card";

export { Card };
