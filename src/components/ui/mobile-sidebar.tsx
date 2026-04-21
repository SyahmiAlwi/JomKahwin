"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, Calendar, CheckSquare, Wallet, Store, Users, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog";
import { Loader2, Camera } from "lucide-react";
import { useT } from "@/lib/i18n/language-context";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isHoverMode?: boolean;
}

export function MobileSidebar({
    isOpen,
    onClose,
    isHoverMode = false
}: MobileSidebarProps) {
    const { user, uploadPhoto, isLoading } = useUser();
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const t = useT();

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("sidebar.guest");
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = user?.user_metadata?.avatar_url;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setSelectedFile(imageUrl);
            setIsCropperOpen(true);
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });
        await uploadPhoto(croppedFile);
        setIsCropperOpen(false);
        setSelectedFile(null);
    };

    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: t("nav.home"), href: "/dashboard" },
        { icon: Calendar, label: t("nav.events"), href: "/dashboard/countdown" },
        { icon: CheckSquare, label: t("nav.checklist"), href: "/dashboard/checklist" },
        { icon: Wallet, label: t("nav.budget"), href: "/dashboard/budget" },
        { icon: Store, label: t("nav.vendors"), href: "/dashboard/suppliers" },
        { icon: Users, label: t("nav.guests"), href: "/dashboard/guests" },
        { icon: Activity, label: t("nav.activity"), href: "/dashboard/activity" },
        { icon: User, label: t("nav.settings"), href: "/dashboard/settings" },
    ];

    const sidebarContent = (
        <div
            className="h-full flex flex-col relative overflow-hidden"
            style={{
                background: "linear-gradient(160deg, #1A0818 0%, #2D1030 60%, #1E0C25 100%)"
            }}
        >
            {/* Batik overlay */}
            <div className="absolute inset-0 bg-batik-dark pointer-events-none opacity-70" />

            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-0 w-24 h-24 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

            {/* Profile Section */}
            <div className="relative z-10 pt-10 pb-6 px-6">
                <div className="flex flex-col items-center gap-3">
                    {/* Avatar */}
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="couple-photo-upload"
                            onChange={handleFileSelect}
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="couple-photo-upload"
                            className={cn(
                                "cursor-pointer block relative",
                                isLoading && "opacity-70 pointer-events-none"
                            )}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-lg transition-all duration-200 group-hover:border-primary/60 group-hover:scale-105 overflow-hidden">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-3xl font-bold font-heading">
                                        {userInitial}
                                    </span>
                                )}
                                <div className={cn(
                                    "absolute inset-0 rounded-full bg-black/50 transition-opacity duration-200 flex items-center justify-center",
                                    isLoading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </div>
                            {/* Online/edit indicator */}
                            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-[#1A0818]" />
                        </label>
                    </div>

                    {/* Name */}
                    <div className="text-center">
                        <h2 className="text-base font-bold text-white font-heading leading-tight">
                            {userName}
                        </h2>
                        <p className="text-white/40 text-xs mt-0.5">{t("sidebar.role")}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-5 h-px bg-white/10" />
            </div>

            {/* Navigation Menu */}
            <nav className="relative z-10 flex-1 px-3 overflow-y-auto">
                <ul className="space-y-0.5">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    onClick={isHoverMode ? undefined : onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-white/15 text-white border border-white/10"
                                            : "text-white/60 hover:bg-white/8 hover:text-white"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        isActive
                                            ? "bg-primary text-white shadow-rose-sm"
                                            : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/80"
                                    )}>
                                        <item.icon className="w-4 h-4" strokeWidth={1.8} />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isActive ? "text-white" : "text-white/65 group-hover:text-white"
                                    )}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom branding */}
            <div className="relative z-10 px-6 py-5">
                <div className="h-px bg-white/10 mb-4" />
                <p className="text-white/20 text-xs text-center tracking-wider">{t("brand.version")}</p>
            </div>
        </div>
    );

    return (
        <>
            {isHoverMode ? sidebarContent : (
                <>
                    {/* Backdrop */}
                    <div
                        className={cn(
                            "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm",
                            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                        onClick={onClose}
                    />

                    {/* Sidebar Drawer */}
                    <div
                        className={cn(
                            "fixed top-0 left-0 h-full w-[280px] z-50 transition-transform duration-300 ease-out",
                            isOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                    >
                        {sidebarContent}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
                            aria-label={t("sidebar.closeMenu")}
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </>
            )}

            <ImageCropperDialog
                open={isCropperOpen}
                onOpenChange={setIsCropperOpen}
                imageSrc={selectedFile}
                onCropComplete={handleCropComplete}
            />
        </>
    );
}
