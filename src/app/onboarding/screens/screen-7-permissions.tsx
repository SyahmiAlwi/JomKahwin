"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n/language-context";

export default function Screen7Permissions() {
  const { nextScreen } = useOnboarding();
  const t = useT();

  // For now, we'll show a notification permission screen
  // In production, you'd detect actual permissions from the manifest
  const handleAllow = async () => {
    // Request notification permission (if needed)
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.log("Notification permission denied");
      }
    }
    nextScreen();
  };

  const handleSkip = () => {
    nextScreen();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={7} total={10} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {t("onb.s7.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("onb.s7.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {[
            t("onb.s7.benefit.1"),
            t("onb.s7.benefit.2"),
            t("onb.s7.benefit.3"),
            t("onb.s7.benefit.4"),
          ].map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex gap-2 items-center"
            >
              <span className="text-primary">✓</span>
              <p className="text-foreground">{benefit}</p>
            </motion.div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={handleAllow}>
            {t("onb.s7.allow")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleSkip}>
            {t("onb.s7.skip")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
