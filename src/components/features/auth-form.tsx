"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setMessage({ type: "success", text: "Pautan log masuk telah dihantar ke emel anda!" });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Ralat berlaku.";
            setMessage({ type: "error", text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white/90 backdrop-blur-sm border-accent/20 shadow-xl">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-heading font-bold text-primary">Selamat Datang</h2>
                <p className="text-muted-foreground">Masukkan emel untuk mula merancang.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        type="email"
                        placeholder="nama@contoh.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white"
                    />
                </div>

                <Button type="submit" className="w-full text-lg" disabled={loading} isLoading={loading}>
                    {loading ? "Menghantar..." : "Hantar Pautan Ajaib"}
                </Button>
            </form>

            {message && (
                <div
                    className={`p-4 rounded-lg text-sm font-medium ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Atau</span>
                </div>
            </div>

            <div className="grid gap-2">
                <Button variant="outline" type="button" disabled={loading}>
                    Log Masuk dengan Google (Akan Datang)
                </Button>
            </div>
        </Card>
    );
}
