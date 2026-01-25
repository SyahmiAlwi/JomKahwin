"use client";

import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [clickSidebarOpen, setClickSidebarOpen] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Open sidebar immediately and clear any pending close timeout
    const openSidebar = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setSidebarOpen(true);
    };

    // Schedule sidebar close with 350ms delay
    const scheduleSidebarClose = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setSidebarOpen(false);
        }, 350);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop: Hover-based Sidebar (hidden on mobile) */}
            <aside
                onMouseEnter={openSidebar}
                onMouseLeave={scheduleSidebarClose}
                className={`
                    hidden md:block
                    bg-white border-r border-border relative z-50 overflow-hidden
                    transition-[transform,width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${sidebarOpen
                        ? 'w-64 translate-x-0 shadow-2xl shadow-black/10'
                        : 'w-0 -translate-x-6 pointer-events-none shadow-none'
                    }
                `}
            >
                <div className={`
                    h-full flex flex-col transition-opacity duration-500 w-64
                    ${sidebarOpen
                        ? 'opacity-100'
                        : 'opacity-0 translate-x-6 pointer-events-none'
                    }
                `}>
                    <MobileSidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        isHoverMode={true}
                    />
                </div>
            </aside>

            {/* Mobile: Click-to-open Modal Sidebar (visible only on mobile) */}
            <div className="md:hidden">
                <MobileSidebar
                    isOpen={clickSidebarOpen}
                    onClose={() => setClickSidebarOpen(false)}
                    isHoverMode={false}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-30">
                    {/* Desktop: Hover to open, Mobile: Click to open */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onMouseEnter={openSidebar}
                        onMouseLeave={scheduleSidebarClose}
                        onClick={() => setClickSidebarOpen(true)}
                        className="hover:bg-primary/10"
                    >
                        <Menu />
                    </Button>
                    <span className="font-heading font-bold text-xl text-primary">JomKahwin!</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Main Content */}
                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
