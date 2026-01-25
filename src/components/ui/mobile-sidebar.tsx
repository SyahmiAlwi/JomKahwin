"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, Calendar, CheckSquare, Wallet, Store, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    // Removed userName/userInitial as they will come from context
    isHoverMode?: boolean;
}

import { useUser } from "@/components/providers/user-provider";
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog";
import { Loader2, Camera } from "lucide-react";

export function MobileSidebar({
    isOpen,
    onClose,
    isHoverMode = false
}: MobileSidebarProps) {
    const { user, uploadPhoto, isLoading } = useUser();
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [tempFile, setTempFile] = useState<File | null>(null); // Store original file for type checks? No, we need object URL.

    // User Data
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Tetamu";
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = user?.user_metadata?.avatar_url;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("File input changed", e.target.files);
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            console.log("File selected:", file.name, "URL:", imageUrl);
            setSelectedFile(imageUrl);
            setIsCropperOpen(true);
            // reset input value so same file can be selected again if cancelled
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        console.log("Crop complete. Blob size:", croppedBlob.size);
        const croppedFile = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });
        await uploadPhoto(croppedFile);
        setIsCropperOpen(false);
        setSelectedFile(null);
    };
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
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-white/40 shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-105 overflow-hidden">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={userName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-4xl font-bold font-heading">
                                            {userInitial}
                                        </span>
                                    )}

                                    {/* Upload Overlay on Hover or Loading */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-full bg-black/40 transition-opacity duration-200 flex items-center justify-center",
                                        isLoading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        {isLoading ? (
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-white" />
                                        )}
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

    return (
        <>
            {isHoverMode ? sidebarContent : (
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
