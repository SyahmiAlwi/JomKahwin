"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Wallet } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Rancang Hari Bahagiamu Dengan Tenang",
    desc: "Segala persiapan majlis, dari tunang ke bersanding, kini lebih teratur.",
    icon: Heart,
    color: "text-primary",
  },
  {
    id: 2,
    title: "Urus Bajet, Checklist & Jemputan",
    desc: "Pantau perbelanjaan dan senarai tetamu tanpa pening kepala.",
    icon: Wallet,
    color: "text-accent",
  },
  {
    id: 3,
    title: "Ajak Pasangan & Keluarga",
    desc: "Kolaborasi bersama pasangan dan ibu bapa dalam satu aplikasi.",
    icon: Users,
    color: "text-secondary",
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-background relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-batik-pattern opacity-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-batik-pattern opacity-10 translate-x-1/2 translate-y-1/2 rounded-full blur-xl" />

      {/* Skip Button */}
      <div className="w-full flex justify-end relative z-10">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Terus ke Dashboard
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <div className={`p-6 rounded-full bg-white shadow-lg mb-8 ${slides[currentSlide].color}`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon size={48} />;
              })()}
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4 leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 mb-8">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
            />
          ))}
        </div>

        {/* Button */}
        <div className="w-full relative z-10">
          {currentSlide === slides.length - 1 ? (
            <Link href="/dashboard" className="w-full">
              <Button size="lg" className="w-full text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                Mula Rancang
              </Button>
            </Link>
          ) : (
            <Button onClick={nextSlide} size="lg" className="w-full text-lg" variant="secondary">
              Seterusnya <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
