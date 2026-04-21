"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Bell, Lock, Globe, LogOut, ChevronRight, Moon, Copy, Check, RefreshCw, UserPlus, Users2, Clock, XCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/providers/user-provider";
import { useWedding } from "@/components/providers/wedding-provider";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { LangCode } from "@/lib/i18n/translations";

const LANGUAGES = [
    { value: "ms", labelKey: "language.ms" },
    { value: "en", labelKey: "language.en" },
] as const;

const LS_NOTIFICATIONS = "jomkahwin_notifications";

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const { weddingId, inviteCode, members, isLoading: weddingLoading, refreshWedding } = useWedding();
    const supabase = createClient();
    const { lang, setLang, t } = useLanguage();

    // ── Local prefs ──────────────────────────────────────────
    const [notifications, setNotifications] = useState(true);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    useEffect(() => {
        const savedNotif = localStorage.getItem(LS_NOTIFICATIONS);
        if (savedNotif !== null) setNotifications(savedNotif === "true");
    }, []);

    const handleNotificationToggle = (checked: boolean) => {
        setNotifications(checked);
        localStorage.setItem(LS_NOTIFICATIONS, String(checked));
    };

    const handleLanguageChange = (val: LangCode) => {
        setLang(val);
        setLangMenuOpen(false);
        toast({ title: t("settings.languageUpdated"), variant: "default" });
    };

    // ── Edit profile dialog ──────────────────────────────────
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const openEditDialog = () => {
        setEditName(user?.user_metadata?.full_name ?? "");
        setEditOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast({ title: t("settings.editName.empty"), variant: "error" });
            return;
        }
        setEditLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: editName.trim() },
            });
            if (error) throw error;
            toast({ title: t("settings.profileUpdated"), variant: "default" });
            setEditOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("common.tryAgain");
            toast({ title: t("settings.profileUpdateFail"), description: msg, variant: "error" });
        } finally {
            setEditLoading(false);
        }
    };

    // ── Collaboration ─────────────────────────────────────────
    const [copied, setCopied] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    type JoinRequest = { id: string; requester_id: string; requester_name: string; status: string; created_at: string };
    const [incomingRequests, setIncomingRequests] = useState<JoinRequest[]>([]);
    const [myRequestStatus, setMyRequestStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none");
    const [respondingId, setRespondingId] = useState<string | null>(null);

    const fetchJoinRequests = useCallback(async () => {
        if (!weddingId) return;
        try {
            const { data } = await supabase.rpc("get_join_requests");
            if (data) setIncomingRequests(data as JoinRequest[]);
        } catch { /* non-fatal */ }
    }, [supabase, weddingId]);

    useEffect(() => { fetchJoinRequests(); }, [fetchJoinRequests]);

    useEffect(() => {
        if (!weddingId) return;
        const channel = supabase
            .channel("join-requests")
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "wedding_join_requests",
            }, () => {
                fetchJoinRequests();
                refreshWedding();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, weddingId, fetchJoinRequests, refreshWedding]);

    const handleRespondRequest = async (requestId: string, action: "accept" | "reject") => {
        setRespondingId(requestId);
        try {
            const { error } = await supabase.rpc("respond_to_join_request", {
                p_request_id: requestId,
                p_action: action,
            });
            if (error) throw error;
            toast({
                title: action === "accept" ? t("settings.accepted") : t("settings.requestRejectedShort"),
                description: action === "accept" ? t("settings.memberAdded") : t("settings.requestRejectedDesc"),
                variant: action === "accept" ? "success" : "default",
            });
            await fetchJoinRequests();
            if (action === "accept") await refreshWedding();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("common.tryAgain");
            toast({ title: t("settings.respondFail"), description: msg, variant: "error" });
        } finally {
            setRespondingId(null);
        }
    };

    const handleCopyCode = async () => {
        if (!inviteCode) return;
        try {
            await navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({ title: t("settings.codeCopied"), variant: "default" });
        } catch {
            toast({ title: t("settings.codeCopyFail"), variant: "error" });
        }
    };

    const handleJoinWedding = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        try {
            const result = await supabase.rpc("join_wedding_by_code", { code: joinCode.trim().toLowerCase() });
            if (result.error) throw result.error;
            toast({
                title: t("settings.joinRequestSent"),
                description: t("settings.joinRequestSentBody"),
                variant: "default",
            });
            setJoinCode("");
            setMyRequestStatus("pending");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("settings.joinFailInvalid");
            toast({ title: t("settings.joinFail"), description: msg, variant: "error" });
        } finally {
            setJoining(false);
        }
    };

    const handleRegenerateCode = async () => {
        setRegenerating(true);
        try {
            const { error } = await supabase.rpc("regenerate_invite_code");
            if (error) throw error;
            await refreshWedding();
            toast({ title: t("settings.newCodeGenerated"), variant: "default" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("common.tryAgain");
            toast({ title: t("settings.regenerateFail"), description: msg, variant: "error" });
        } finally {
            setRegenerating(false);
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
            const msg = err instanceof Error ? err.message : t("common.tryAgain");
            toast({ title: t("settings.signOutFail"), description: msg, variant: "error" });
            setSigningOut(false);
        }
    };

    // ── Password reset ────────────────────────────────────────
    const [resetLoading, setResetLoading] = useState(false);

    const handlePasswordReset = async () => {
        const email = user?.email;
        if (!email) {
            toast({ title: t("settings.emailNotFound"), variant: "error" });
            return;
        }
        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast({
                title: t("settings.emailSent"),
                description: t("settings.emailSentBody", { email }),
                variant: "default",
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("common.tryAgain");
            toast({ title: t("settings.sendEmailFail"), description: msg, variant: "error" });
        } finally {
            setResetLoading(false);
        }
    };

    // ── Display values ────────────────────────────────────────
    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split("@")[0] ??
        t("common.user");
    const displayEmail = user?.email ?? "–";
    const initials = displayName.charAt(0).toUpperCase();
    const currentLangLabel = t(LANGUAGES.find((l) => l.value === lang)?.labelKey ?? "language.ms");
    const dateLocale = lang === "en" ? "en-GB" : "ms-MY";

    return (
        <div className="space-y-8 pb-24">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">{t("settings.title")}</h1>
                <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
            </div>

            {/* Profile Hero Card */}
            <div
                className="relative rounded-2xl overflow-hidden p-6"
                style={{ background: "linear-gradient(135deg, #1A0818 0%, #2D1030 100%)" }}
            >
                <div className="absolute inset-0 bg-batik-dark pointer-events-none opacity-70" />
                <div className="absolute right-0 top-0 w-48 h-48 bg-primary/20 blur-3xl pointer-events-none rounded-full" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white text-2xl font-bold font-heading shrink-0 overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-heading font-bold text-white truncate">{displayName}</h3>
                        <p className="text-white/50 text-sm truncate">{displayEmail}</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={openEditDialog}
                        className="shrink-0 bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm"
                    >
                        {t("settings.editProfile")}
                    </Button>
                </div>
            </div>

            {/* Settings Groups */}
            <div className="space-y-6">
                {/* App Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">{t("settings.section.app")}</h4>
                    <Card className="divide-y divide-border overflow-hidden border-border p-0">
                        <div className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t("settings.notifications")}</span>
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={handleNotificationToggle}
                            />
                        </div>

                        <div
                            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer relative"
                            onClick={() => setLangMenuOpen((o) => !o)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t("settings.language")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-sm">{currentLangLabel}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${langMenuOpen ? "rotate-90" : ""}`} />
                            </div>

                            {langMenuOpen && (
                                <div className="absolute right-4 top-full mt-1 z-10 bg-popover border border-border rounded-xl shadow-md overflow-hidden min-w-[160px]">
                                    {LANGUAGES.map((l) => (
                                        <button
                                            key={l.value}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLanguageChange(l.value);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                                                lang === l.value ? "font-semibold text-primary" : "text-foreground"
                                            }`}
                                        >
                                            {t(l.labelKey)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Moon className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">{t("settings.darkMode")}</span>
                                    <p className="text-xs text-muted-foreground">{t("settings.comingSoon")}</p>
                                </div>
                            </div>
                            <Switch disabled />
                        </div>
                    </Card>
                </div>

                {/* Collaboration Section */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">{t("settings.section.collab")}</h4>
                    <Card className="p-6 border-border space-y-5">
                        {weddingLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users2 className="h-4 w-4 text-primary" />
                                        <Label className="text-sm font-semibold">{t("settings.inviteCode")}</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
                                            <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                                                {inviteCode ?? "------"}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleCopyCode}
                                                    disabled={!inviteCode}
                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                    title={t("settings.copyCode")}
                                                >
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleRegenerateCode}
                                                    disabled={regenerating}
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    title={t("settings.regenerate")}
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {members.length <= 1 && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <span>💡</span>
                                            {t("settings.sharePrompt")}
                                        </p>
                                    )}
                                </div>

                                {members.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">{t("settings.members", { count: members.length })}</Label>
                                        <div className="space-y-2">
                                            {members.map((member) => {
                                                const name = member.full_name ?? member.user_id.slice(0, 8);
                                                const initial = name.charAt(0).toUpperCase();
                                                const isMe = member.user_id === user?.id;
                                                const joinedDate = new Date(member.joined_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });
                                                return (
                                                    <div key={member.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                                                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                                                            {member.avatar_url ? (
                                                                <img src={member.avatar_url} alt={name} className="w-full h-full object-cover" />
                                                            ) : initial}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-foreground text-sm truncate">
                                                                {name}{isMe && <span className="text-xs text-primary ml-1.5 font-normal">({t("common.you")})</span>}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{t("settings.joined", { date: joinedDate })}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-semibold">{t("settings.joinOther")}</Label>
                                    </div>

                                    {myRequestStatus === "pending" ? (
                                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">{t("settings.requestSent")}</p>
                                                <p className="text-xs text-amber-600">{t("settings.requestSentBody")}</p>
                                            </div>
                                        </div>
                                    ) : myRequestStatus === "rejected" ? (
                                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-red-700">{t("settings.requestRejected")}</p>
                                                <p className="text-xs text-red-500">{t("settings.requestRejectedBody")}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder={t("settings.joinCodePlaceholder")}
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleJoinWedding()}
                                                maxLength={8}
                                                className="font-mono tracking-widest"
                                            />
                                            <Button
                                                onClick={handleJoinWedding}
                                                disabled={joining || !joinCode.trim()}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                                            >
                                                {joining ? t("settings.sending") : t("settings.send")}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {incomingRequests.filter(r => r.status === "pending").length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-border/50">
                                        <Label className="text-sm font-semibold text-orange-700 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {t("settings.pendingRequests", { count: incomingRequests.filter(r => r.status === "pending").length })}
                                        </Label>
                                        <div className="space-y-2">
                                            {incomingRequests
                                                .filter(r => r.status === "pending")
                                                .map(req => (
                                                    <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">{req.requester_name ?? t("common.user")}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(req.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1.5 shrink-0">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleRespondRequest(req.id, "accept")}
                                                                disabled={respondingId === req.id}
                                                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                {t("settings.accept")}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRespondRequest(req.id, "reject")}
                                                                disabled={respondingId === req.id}
                                                                className="h-8 px-3 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                {t("settings.reject")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>

                {/* Account Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">{t("settings.section.account")}</h4>
                    <Card className="divide-y divide-border overflow-hidden border-border p-0">
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
                                    {resetLoading ? t("settings.sendingEmail") : t("settings.changePassword")}
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

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
                                    {signingOut ? t("settings.signingOut") : t("settings.signOut")}
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
                        <DialogTitle className="font-heading text-xl">{t("settings.editDialog.title")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="profile-name">{t("common.fullName")}</Label>
                            <Input
                                id="profile-name"
                                placeholder={t("settings.namePlaceholder")}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("common.email")}</Label>
                            <Input value={displayEmail} disabled className="opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-muted-foreground">{t("settings.emailLocked")}</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setEditOpen(false)}
                            disabled={editLoading}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={editLoading}>
                            {editLoading ? t("common.saving") : t("common.save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
