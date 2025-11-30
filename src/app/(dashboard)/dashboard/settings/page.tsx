"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Lock, Globe, LogOut, ChevronRight, Moon } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Tetapan</h1>
                <p className="text-muted-foreground">Urus profil dan pilihan aplikasi anda.</p>
            </div>

            {/* Profile Section */}
            <Card className="p-6 flex items-center gap-4 border-border/50">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                    S
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Syahmi</h3>
                    <p className="text-muted-foreground text-sm">syahmi@example.com</p>
                </div>
                <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5">
                    Edit
                </Button>
            </Card>

            {/* Settings Groups */}
            <div className="space-y-6">
                {/* App Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Aplikasi</h4>
                    <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Notifikasi</span>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Bahasa</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-sm">Bahasa Melayu</span>
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Moon className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Tema Gelap</span>
                            </div>
                            <Switch disabled />
                        </div>
                    </Card>
                </div>

                {/* Account Settings */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Akaun</h4>
                    <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
                        <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Tukar Kata Laluan</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-red-600">Log Keluar</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
