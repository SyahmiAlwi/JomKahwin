"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Users, Wallet, Plus, Heart, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
    const { toast } = useToast();
    const events = [
        { name: "Majlis Tunang", date: "15 Mac 2025", daysLeft: 45, type: "Tunang" },
        { name: "Majlis Nikah", date: "20 Ogos 2025", daysLeft: 203, type: "Nikah" },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section with Gradient Text */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                        Hai, Syahmi
                    </h1>
                </div>
            </div>

            {/* Countdown Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-foreground">Majlis Anda</h2>
                    <Button variant="ghost" className="text-primary hover:bg-primary/5">Lihat Semua</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card variant="songket" className="h-full flex flex-col justify-between p-4 group hover:-translate-y-1 transition-transform duration-300">
                                <div className="relative z-10 flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-heading font-bold text-foreground">{event.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                                        {event.type}
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-primary">{event.daysLeft}</span>
                                        <span className="text-xs text-muted-foreground font-medium">hari lagi</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card variant="glass" className="h-full flex flex-col items-center justify-center border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-all group bg-white/40">
                            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <p className="mt-4 font-medium text-lg text-muted-foreground group-hover:text-primary">Tambah Majlis Baru</p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bajet</p>
                        <p className="text-xl font-bold text-foreground">RM 15,000</p>
                    </div>
                </Card>

                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tugasan</p>
                        <p className="text-xl font-bold text-foreground">12 / 48</p>
                    </div>
                </Card>

                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jemputan</p>
                        <p className="text-xl font-bold text-foreground">145</p>
                    </div>
                </Card>
            </section>
        </div>
    );
}
