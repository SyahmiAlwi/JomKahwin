"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register" | "forgot";

export function AuthForm() {
  const supabase = createClient();
  const { toast } = useToast();

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
        // redirect handled by middleware + onAuthStateChange

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
          title: "Akaun berjaya dicipta!",
          description: "Sila semak emel anda untuk pengesahan.",
          variant: "success",
        });

      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings`,
        });
        if (error) throw error;
        toast({
          title: "Emel dihantar!",
          description: "Semak inbox anda untuk reset kata laluan.",
          variant: "success",
        });
        setMode("login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ralat tidak diketahui";
      toast({ title: "Ralat", description: translateError(message), variant: "error" });
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
      toast({ title: "Ralat", description: error.message, variant: "error" });
      setGoogleLoading(false);
    }
    // on success: browser redirects, no need to setGoogleLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

      {/* Google OAuth */}
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
        Teruskan dengan Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">atau</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Nama Penuh</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nama anda"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Emel</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@emel.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Laluan</Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Lupa kata laluan?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? "Minimum 6 aksara" : "Kata laluan anda"}
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
          {mode === "login" && "Log Masuk"}
          {mode === "register" && "Daftar Akaun"}
          {mode === "forgot" && "Hantar Pautan Reset"}
        </Button>
      </form>

      {/* Mode switcher */}
      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" && (
          <>Belum ada akaun?{" "}
            <button onClick={() => setMode("register")} className="text-foreground font-medium hover:underline">
              Daftar sekarang
            </button>
          </>
        )}
        {mode === "register" && (
          <>Sudah ada akaun?{" "}
            <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
              Log masuk
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
            ← Kembali ke log masuk
          </button>
        )}
      </div>

    </div>
  );
}

// Translate Supabase error messages to Malay
function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Emel atau kata laluan tidak sah.";
  if (msg.includes("Email not confirmed")) return "Sila sahkan emel anda dahulu.";
  if (msg.includes("User already registered")) return "Emel ini sudah didaftarkan.";
  if (msg.includes("Password should be")) return "Kata laluan perlu sekurang-kurangnya 6 aksara.";
  if (msg.includes("rate limit")) return "Terlalu banyak cubaan. Sila tunggu sebentar.";
  return msg;
}
