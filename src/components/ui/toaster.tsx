"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./use-toast";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
    const { toasts, dismiss } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = toast.variant === "success" ? CheckCircle : toast.variant === "error" ? XCircle : Info;

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className={cn(
                                "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-sm",
                                toast.variant === "success" && "bg-green-50/95 border-green-200",
                                toast.variant === "error" && "bg-red-50/95 border-red-200",
                                !toast.variant && "bg-white/95 border-border"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 shrink-0 mt-0.5",
                                toast.variant === "success" && "text-foreground",
                                toast.variant === "error" && "text-red-600",
                                !toast.variant && "text-primary"
                            )} />

                            <div className="flex-1 min-w-0">
                                {toast.title && (
                                    <p className="font-semibold text-foreground text-sm">{toast.title}</p>
                                )}
                                {toast.description && (
                                    <p className="text-muted-foreground text-sm mt-0.5">{toast.description}</p>
                                )}
                            </div>

                            <button
                                onClick={() => dismiss(toast.id)}
                                className="shrink-0 h-6 w-6 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
