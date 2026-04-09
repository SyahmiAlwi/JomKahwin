"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/onboarding-context";

export default function Screen1Welcome() {
  const router = useRouter();
  const { nextScreen, skipOnboarding } = useOnboarding();

  const handleSkip = () => {
    skipOnboarding();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Skip button */}
      <div className="w-full flex justify-end pt-4">
        <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={handleSkip}>
          Skip, terus ke Dashboard
        </Button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-center space-y-8"
      >
        {/* Icon */}
        <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <Heart className="h-10 w-10 text-primary" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-foreground">
            Majlis Impian,<br />
            Tanpa Stress Bajet
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize setiap ringgit dalam satu tempat. Pasangan always tahu apa happening.
          </p>
        </div>

        {/* Mock dashboard preview (simple illustration) */}
        <div className="w-full h-48 rounded-2xl bg-white shadow-lg border border-border/50 overflow-hidden relative">
          <div className="p-4 h-full flex flex-col gap-3">
            {/* Gradient card mock */}
            <div className="h-24 rounded-xl bg-gradient-to-r from-primary to-primary/60 text-white p-3 flex items-center justify-between text-sm font-semibold">
              <div>💍 Nikah</div>
              <div>45 hari</div>
            </div>
            {/* Stats mock */}
            <div className="flex gap-2">
              <div className="flex-1 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-medium">
                💰 RM 50K
              </div>
              <div className="flex-1 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-xs font-medium">
                👥 120 guests
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <div className="w-full max-w-md">
        <Button size="lg" className="w-full text-lg" onClick={nextScreen}>
          Jom start!
        </Button>
      </div>
    </div>
  );
}
