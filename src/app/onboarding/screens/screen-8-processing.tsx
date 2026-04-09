"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { ProgressBar } from "@/components/onboarding/progress-bar";

export default function Screen8Processing() {
  const { nextScreen } = useOnboarding();

  useEffect(() => {
    const timer = setTimeout(() => {
      nextScreen();
    }, 2000);

    return () => clearTimeout(timer);
  }, [nextScreen]);

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={8} total={10} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Animated spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-20 h-20"
        >
          <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Menyediakan rancangan majlis anda...
          </h1>
          <p className="text-muted-foreground">
            Tunggu chill, kami organize semuanya untuk anda
          </p>
        </motion.div>
      </div>
    </div>
  );
}
