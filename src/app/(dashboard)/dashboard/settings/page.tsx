"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { User, Bell, Lock, Globe, LogOut, ChevronRight, Moon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
    { value: "ms", label: "Bahasa Melayu" },
    { value: "en", label: "English" },
] as const;

const LS_NOTIFICATIONS = "jomkahwin_notifications";
const LS_LANGUAGE = "jomkahwin_language";

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const supabase = createClient();

    // ── Local prefs (hydrated from localStorage) ─────────────
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState("ms");
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    useEffect(() => {
        const savedNotif = localStorage.getItem(LS_NOTIFICATIONS);
        if (savedNotif !== null) setNotifications(savedNotif === "true");
        const savedLang = localStorage.getItem(LS_LANGUAGE);
        if (savedLang) setLanguage(savedLang);
    }, []);

    const handleNotificationToggle = (checked: boolean) => {
        setNotifications(checked);
        localStorage.setItem(LS_NOTIFICATIONS, String(checked));
    };

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        localStorage.setItem(LS_LANGUAGE, val);
        setLangMenuOpen(false);
        toast({ title: "Bahasa dikemaskini.", variant: "default" });
    };

    // ── Edit profile dialog ───────────────────────────────────
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const openEditDialog = () => {
        setEditName(user?.user_metadata?.full_name ?? "");
        setEditOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast({ title: "Nama tidak boleh kosong.", variant: "error" });
            return;
        }
        setEditLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: editName.trim() },
            });
            if (error) throw error;
            toast({ title: "Profil dikemaskini!", variant: "default" });
            setEditOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sila cuba lagi.";
            toast({ title: "Gagal mengemaskini profil", description: msg, variant: "error" });
        } finally {
            setEditLoading(false);
        }
    };

    // ── Sign out ──────────────────────────────────────────────
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await supabase.auth.signOut();
            router.push("/login");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sila cuba lagi.";
            toast({ title: "Gagal log keluar", description: msg, variant: "error" });
            setSigningOut(false);
        }
    };

    // ── Password reset ────────────────────────────────────────
    const [resetLoading, setResetLoading] = useState(false);

    const handlePasswordReset = async () => {
        const email = user?.email;
        if (!email) {
            toast({ title: "E-mel tidak dijumpai.", variant: "error" });
            return;
        }
        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast({
                title: "E-mel dihantar!",
                description: `Semak peti masuk anda di ${email}.`,
                variant: "default",
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sila cuba lagi.";
            toast({ title: "Gagal menghantar e-mel", description: msg, variant: "error" });
        } finally {
            setResetLoading(false);
        }
    };

    // ── Display values ────────────────────────────────────────
    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split("@")[0] ??
        "Pengguna";
    const displayEmail = user?.email ?? "–";
    const initials = displayName.charAt(0).toUpperCase();
    const currentLangLabel =
        LANGUAGES.find((l) => l.value === language)?.label ?? "Bahasa Melayu";

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Tetapan</h1>
                <p className="text-muted-foreground">Urus profil dan pilihan aplikasi anda.</p>
            </div>

            {/* Profile Section */}
            <Card className="p-6 flex items-center gap-4 border-border/50">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">{displayName}</h3>
                    <p className="text-muted-foreground text-sm truncate">{displayEmail}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={openEditDialog}
                    className="rounded-full border-primary/20 text-primary hover:bg-primary/5 shrink-0"
                >
                    Edit Profil
                </Button>
            </Card>

            {/* Settings Groups */}
            <div className="space-y-6">
                {/* App Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Aplikasi</h4>
                    <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
                        {/* Notifications */}
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Notifikasi</span>
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={handleNotificationToggle}
                            />
                        </div>

                        {/* Language */}
                        <div
                            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer relative"
                            onClick={() => setLangMenuOpen((o) => !o)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Bahasa</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-sm">{currentLangLabel}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${langMenuOpen ? "rotate-90" : ""}`} />
                            </div>

                            {/* Inline language picker */}
                            {langMenuOpen && (
                                <div className="absolute right-4 top-full mt-1 z-10 bg-popover border border-border rounded-xl shadow-md overflow-hidden min-w-[160px]">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.value}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLanguageChange(lang.value);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                                                language === lang.value ? "font-semibold text-primary" : "text-foreground"
                                            }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dark mode (disabled) */}
                        <div className="p-4 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Moon className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">Tema Gelap</span>
                                    <p className="text-xs text-muted-foreground">Akan datang</p>
                                </div>
                            </div>
                            <Switch disabled />
                        </div>
                    </Card>
                </div>

                {/* Account Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Akaun</h4>
                    <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
                        {/* Change password */}
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            disabled={resetLoading}
                            className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors disabled:opacity-60"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">
                                    {resetLoading ? "Menghantar e-mel…" : "Tukar Kata Laluan"}
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Sign out */}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors group disabled:opacity-60"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-red-600">
                                    {signingOut ? "Log Keluar…" : "Log Keluar"}
                                </span>
                            </div>
                        </button>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">Edit Profil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="profile-name">Nama Penuh</Label>
                            <Input
                                id="profile-name"
                                placeholder="Nama anda"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>E-mel</Label>
                            <Input value={displayEmail} disabled className="opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-muted-foreground">E-mel tidak boleh diubah dari sini.</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setEditOpen(false)}
                            disabled={editLoading}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={editLoading}>
                            {editLoading ? "Menyimpan…" : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
