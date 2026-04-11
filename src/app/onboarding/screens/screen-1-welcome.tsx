"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";

export default function Screen1Welcome() {
  const router = useRouter();
  const { nextScreen, skipOnboarding } = useOnboarding();

  const handleSkip = () => {
    skipOnboarding();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-background">
      {/* Dark hero top section */}
      <div
        className="relative flex-shrink-0 pt-16 pb-20 px-6 text-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A0818 0%, #2D1030 65%, #3A1538 100%)" }}
      >
        {/* Batik overlay */}
        <div className="absolute inset-0 bg-batik-dark pointer-events-none opacity-70" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/25 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-accent/20 blur-[60px] pointer-events-none" />

        {/* Skip */}
        <div className="absolute top-5 right-5 z-20">
          <button
            onClick={handleSkip}
            className="text-white/40 hover:text-white/70 text-sm transition-colors font-medium"
          >
            Langkau
          </button>
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Heart className="h-8 w-8 text-primary fill-primary/30" />
            </div>
          </div>

          <h1 className="font-heading text-4xl font-bold text-white leading-tight mb-3">
            Majlis Kita,<br />
            <span className="text-gradient-primary">Dalam satu platform!</span>
          </h1>
          <p className="text-white/55 text-base leading-relaxed max-w-xs mx-auto">
            Organize setiap ringgit dalam suatu tempat. Partner always up-to-date!.
          </p>
        </motion.div>
      </div>

      {/* Curved transition */}
      <div className="relative z-10 -mt-6">
        <svg viewBox="0 0 390 40" preserveAspectRatio="none" className="w-full" style={{ height: 40 }}>
          <path d="M0,40 Q195,0 390,40 L390,40 L0,40 Z" fill="var(--background)" />
        </svg>
      </div>

      {/* Content cards */}
      <div className="flex-1 px-6 -mt-2 space-y-4 pb-6">
        {[
          { emoji: "💰", title: "Bajet Sekilas Pandang", desc: "Tahu berapa dah habis, berapa lagi ada." },
          { emoji: "👥", title: "Senarai RSVP Guest", desc: "Manage jemputan mengikut kumpulan." },
          { emoji: "✅", title: "Checklist Perkahwinan", desc: "Tak tertinggal satu pun persiapan." },
          { emoji: "💍", title: "Countdown Hari Istimewa", desc: "Lihat kiraan hari hingga majlis." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-border shadow-sm"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center text-xl shrink-0">
              {item.emoji}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{item.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button size="lg" className="w-full shadow-rose-md" onClick={nextScreen}>
            Jom Start!
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Percuma sepenuhnya · Tiada kad kredit diperlukan
          </p>
        </motion.div>
      </div>
    </div>
  );
}
