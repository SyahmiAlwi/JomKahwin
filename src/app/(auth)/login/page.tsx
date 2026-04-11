"use client";

import { motion } from "framer-motion";
import { AuthForm } from "@/components/features/auth-form";
import { Heart } from "lucide-react";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex overflow-hidden">

            {/* ── Left Panel — Brand Identity (hidden on mobile) ── */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center overflow-hidden bg-dark-gradient">
                {/* Batik overlay */}
                <div className="absolute inset-0 bg-batik-dark pointer-events-none" />

                {/* Glow orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/15 blur-[100px]" />

                {/* Corner decorative rose */}
                <div className="absolute top-8 right-8 opacity-20">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/40" />
                    <div className="absolute top-4 left-4 w-24 h-24 rounded-full border border-primary/25" />
                    <div className="absolute top-8 left-8 w-16 h-16 rounded-full border border-primary/15" />
                </div>
                <div className="absolute bottom-8 left-8 opacity-20">
                    <div className="w-24 h-24 rounded-full border-2 border-accent/40" />
                    <div className="absolute top-3 left-3 w-18 h-18 rounded-full border border-accent/25" />
                </div>

                {/* Content */}
                <motion.div
                    className="relative z-10 text-center px-12 max-w-md"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Logo icon */}
                    <div className="flex justify-center mb-8">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Heart className="h-8 w-8 text-primary fill-primary/30" />
                        </div>
                    </div>

                    <h1 className="font-heading text-5xl font-bold text-white leading-tight mb-4">
                        JomKahwin!
                    </h1>

                    <p className="text-white/60 text-lg leading-relaxed mb-10">
                        Rancang majlis perkahwinan impian anda bersama-sama, dari bajet hingga tetamu.
                    </p>

                    {/* Features list */}
                    <div className="space-y-3 text-left">
                        {[
                            { emoji: "💰", text: "Jejak bajet & tabung kahwin" },
                            { emoji: "👥", text: "Senarai tetamu mudah" },
                            { emoji: "✅", text: "Senarai semak perkahwinan" },
                            { emoji: "💍", text: "Countdown ke hari istimewa" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-3 text-white/70"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            >
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-sm font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom tagline */}
                <motion.p
                    className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Percuma sepenuhnya · Untuk pasangan Malaysia
                </motion.p>
            </div>

            {/* ── Right Panel — Auth Form ── */}
            <div className="flex-1 flex flex-col items-center justify-center bg-background relative px-6 py-12 overflow-y-auto">
                {/* Mobile brand header */}
                <div className="lg:hidden text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Heart className="h-6 w-6 text-primary fill-primary/20" />
                        </div>
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">JomKahwin!</h1>
                    <p className="text-muted-foreground text-sm mt-1">Rancang majlis impian anda.</p>
                </div>

                {/* Auth card */}
                <motion.div
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] border border-border p-8">
                        <AuthForm />
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Dengan meneruskan, anda bersetuju dengan{" "}
                        <span className="text-primary hover:underline cursor-pointer">terma perkhidmatan</span>{" "}
                        kami.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
