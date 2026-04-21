"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/i18n/language-context";

type Mode = "login" | "register" | "forgot";
type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function AuthForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const t = useT();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast({
          title: t("auth.accountCreated"),
          description: t("auth.accountCreatedBody"),
          variant: "success",
        });
        setMode("login");
        setPassword("");
        setFullName("");

      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings`,
        });
        if (error) throw error;
        toast({
          title: t("auth.emailSent"),
          description: t("auth.emailSentBody"),
          variant: "success",
        });
        setMode("login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("auth.errorUnknown");
      toast({ title: t("common.error"), description: translateError(message, t), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "error" });
      setGoogleLoading(false);
    }
  }

  const headings = {
    login: { title: t("auth.login.title"), subtitle: t("auth.login.subtitle") },
    register: { title: t("auth.register.title"), subtitle: t("auth.register.subtitle") },
    forgot: { title: t("auth.forgot.title"), subtitle: t("auth.forgot.subtitle") },
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{headings[mode].title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{headings[mode].subtitle}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        isLoading={googleLoading}
        className="w-full gap-2"
      >
        {!googleLoading && (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
        )}
        {t("auth.continueGoogle")}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">{t("common.or")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">{t("common.fullName")}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t("auth.fullNamePlaceholder")}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("common.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("common.password")}</Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? t("auth.passwordRegister") : t("auth.passwordLogin")}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        <Button type="submit" isLoading={loading} className="w-full mt-1">
          {mode === "login" && t("auth.signInButton")}
          {mode === "register" && t("auth.registerButton")}
          {mode === "forgot" && t("auth.forgotButton")}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" && (
          <>{t("auth.noAccount")}{" "}
            <button onClick={() => setMode("register")} className="text-foreground font-medium hover:underline">
              {t("auth.registerNow")}
            </button>
          </>
        )}
        {mode === "register" && (
          <>{t("auth.hasAccount")}{" "}
            <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
              {t("auth.signIn")}
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
            {t("auth.backToLogin")}
          </button>
        )}
      </div>

    </div>
  );
}

function translateError(msg: string, t: TranslateFn): string {
  if (msg.includes("Invalid login credentials")) return t("auth.err.invalidCreds");
  if (msg.includes("Email not confirmed")) return t("auth.err.notConfirmed");
  if (msg.includes("User already registered")) return t("auth.err.alreadyRegistered");
  if (msg.includes("Password should be")) return t("auth.err.passwordShort");
  if (msg.includes("rate limit")) return t("auth.err.rateLimit");
  return msg;
}
