"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, Calendar, CheckSquare, Wallet, Store, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userInitial?: string;
    isHoverMode?: boolean;
}

export function MobileSidebar({
    isOpen,
    onClose,
    userName = "Cami ❤️ Cira",
    userInitial = "S",
    isHoverMode = false
}: MobileSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: "Utama", href: "/dashboard" },
        { icon: Calendar, label: "Majlis", href: "/dashboard/countdown" },
        { icon: CheckSquare, label: "Senarai Semak", href: "/dashboard/checklist" },
        { icon: Wallet, label: "Bajet", href: "/dashboard/budget" },
        { icon: Store, label: "Vendor", href: "/dashboard/suppliers" },
        { icon: Users, label: "Senarai Tetamu", href: "/dashboard/guests" },
        { icon: User, label: "Tetapan", href: "/dashboard/settings" },
    ];

    const sidebarContent = (
        <>
            {/* Pale Gold/Cream Background (Top 40%) - JomKahwin Theme */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-secondary" />

            {/* White Background with Curved Top (Bottom 60%) */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-white">
                {/* SVG Curved Wave */}
                <svg
                    className="absolute top-0 left-0 w-full"
                    style={{ transform: "translateY(-99%)" }}
                    viewBox="0 0 280 60"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,60 Q140,0 280,60 L280,60 L0,60 Z"
                        fill="white"
                    />
                </svg>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col">
                {/* Header with Couple Photo - Centered & Clickable */}
                <div className="pt-12 pb-8 px-6">
                    <div className="flex flex-col items-center gap-3">
                        {/* Couple Photo Frame - Clickable to Upload (Bigger: 96px) */}
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="couple-photo-upload"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // TODO: Handle photo upload
                                        console.log('Photo selected:', file);
                                    }
                                }}
                            />
                            <label
                                htmlFor="couple-photo-upload"
                                className="cursor-pointer block relative"
                            >
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-white/40 shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-105">
                                    <span className="text-white text-4xl font-bold font-heading">
                                        {userInitial}
                                    </span>
                                    {/* Upload Overlay on Hover */}
                                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-8 h-8 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Couple Names Below Photo */}
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-foreground font-heading">
                                {userName}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 pt-4">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        onClick={isHoverMode ? undefined : onClose}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3.5 rounded-lg transition-colors duration-200 group",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-5 h-5 transition-colors",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                            )}
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-base font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );

    // Hover mode: render only the content without backdrop/overlay
    if (isHoverMode) {
        return sidebarContent;
    }

    // Modal mode: render with backdrop and close button
    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Drawer */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full w-[280px] bg-white z-50 transition-transform duration-300 ease-out shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5 text-foreground" />
                </button>
            </div>
        </>
    );
}
