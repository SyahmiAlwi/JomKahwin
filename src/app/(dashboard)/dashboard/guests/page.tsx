"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, UserCheck, UserX, HelpCircle, Phone, MessageCircle, MoreHorizontal } from "lucide-react";

// Mock Data
const initialGuests = [
    { id: 1, name: "Ahmad Albab", relation: "Keluarga", rsvp: "hadir", pax: 2, phone: "+60123456789" },
    { id: 2, name: "Siti Nurhaliza", relation: "Kawan", rsvp: "pending", pax: 1, phone: "+60198765432" },
    { id: 3, name: "Mawi World", relation: "Keluarga", rsvp: "tidak", pax: 0, phone: "+60135555555" },
    { id: 4, name: "Faizal Tahir", relation: "Rakan Kerja", rsvp: "hadir", pax: 4, phone: "+60177777777" },
    { id: 5, name: "Yuna Zarai", relation: "Kawan", rsvp: "pending", pax: 1, phone: "+60144444444" },
];

export default function GuestListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [guests, setGuests] = useState(initialGuests);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: "", relation: "", phone: "" });
    const { toast } = useToast();

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        hadir: guests.filter(g => g.rsvp === "hadir").length,
        pending: guests.filter(g => g.rsvp === "pending").length,
        tidak: guests.filter(g => g.rsvp === "tidak").length,
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Senarai Tetamu</h1>
                    <p className="text-muted-foreground">Urus jemputan dan RSVP majlis anda.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="icon" className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center bg-green-50 border-green-100">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-green-700">{stats.hadir}</span>
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Hadir</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center bg-amber-50 border-amber-100">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-amber-700">{stats.pending}</span>
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Menunggu</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center bg-red-50 border-red-100">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                        <UserX className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-red-700">{stats.tidak}</span>
                    <span className="text-xs font-medium text-red-600 uppercase tracking-wider">Tidak</span>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Cari nama tetamu..."
                    className="pl-10 h-12 rounded-2xl bg-white border-border/50 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Guest List */}
            <div className="space-y-3">
                {filteredGuests.map((guest, index) => (
                    <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-all border-border/50 group">
                            {/* Avatar */}
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg shrink-0">
                                {guest.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground truncate">{guest.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                                        {guest.relation}
                                    </span>
                                    {guest.rsvp === "hadir" && (
                                        <span className="flex items-center gap-1 text-xs">
                                            <UserCheck className="h-3 w-3" /> {guest.pax} Pax
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button onClick={() => window.open(`https://wa.me/${guest.phone.replace(/\+/g, '')}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-green-600 hover:bg-green-50">
                                    <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => window.open(`tel:${guest.phone}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-600 hover:bg-blue-50">
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Add Guest Dialog */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Tambah Tetamu">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const newId = Math.max(...guests.map(g => g.id)) + 1;
                    setGuests([...guests, {
                        id: newId,
                        name: newGuest.name,
                        relation: newGuest.relation,
                        rsvp: "pending",
                        pax: 1,
                        phone: newGuest.phone
                    }]);
                    toast({ title: "Berjaya!", description: "Tetamu baru ditambah.", variant: "success" });
                    setNewGuest({ name: "", relation: "", phone: "" });
                    setIsDialogOpen(false);
                }} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nama</label>
                        <Input
                            value={newGuest.name}
                            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                            placeholder="Nama tetamu"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Hubungan</label>
                        <Input
                            value={newGuest.relation}
                            onChange={(e) => setNewGuest({ ...newGuest, relation: e.target.value })}
                            placeholder="Contoh: Keluarga"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Telefon</label>
                        <Input
                            type="tel"
                            value={newGuest.phone}
                            onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                            placeholder="+60123456789"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Tambah
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
