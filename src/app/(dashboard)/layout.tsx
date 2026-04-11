"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { WeddingProvider } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [clickSidebarOpen, setClickSidebarOpen] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split("@")[0] ??
        "?";
    const initials = displayName.charAt(0).toUpperCase();
    const avatarUrl = user?.user_metadata?.avatar_url;

    const openSidebar = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setSidebarOpen(true);
    };

    const scheduleSidebarClose = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setSidebarOpen(false);
        }, 350);
    };

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setMounted(true);
        const onboardingCompleted = localStorage.getItem("onboarding_completed");
        if (!onboardingCompleted) {
            router.push("/onboarding");
        }
    }, [router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop: Hover-based Sidebar */}
            <aside
                onMouseEnter={openSidebar}
                onMouseLeave={scheduleSidebarClose}
                className={`
                    hidden md:block
                    relative z-50 overflow-hidden
                    transition-[transform,width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${sidebarOpen
                        ? 'w-64 translate-x-0 shadow-dark-lg'
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

            {/* Mobile: Click-to-open Modal Sidebar */}
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
                <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-border sticky top-0 z-30 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onMouseEnter={openSidebar}
                        onMouseLeave={scheduleSidebarClose}
                        onClick={() => setClickSidebarOpen(true)}
                        className="hover:bg-primary/8 rounded-xl"
                    >
                        <Menu className="h-5 w-5 text-foreground/70" />
                    </Button>

                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary fill-primary/30" />
                        <span className="font-heading font-bold text-lg text-primary tracking-wide">JomKahwin!</span>
                    </div>

                    {/* User avatar */}
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 select-none">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-5 md:p-8 flex-1">
                    <WeddingProvider>
                        {children}
                    </WeddingProvider>
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
