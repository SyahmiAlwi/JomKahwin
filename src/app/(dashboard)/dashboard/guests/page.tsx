"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, UserCheck, MessageCircle, Phone, Users, User, Heart, Briefcase, UserPlus, Settings, Trash2, Edit2, Palette, Star, Home } from "lucide-react";

// Types
type Guest = {
    id: number;
    name: string;
    relation: string;
    group: string;
    rsvp: "hadir" | "tidak" | "pending";
    pax: number;
    phone: string;
};

type Group = {
    id: string;
    label: string;
    icon: any;
    color: string;
};

// Initial Data
const initialGuests: Guest[] = [
    { id: 1, name: "Pak Long Dolah", relation: "Bapa Saudara", group: "Keluarga Lelaki", rsvp: "hadir", pax: 4, phone: "+60123456789" },
    { id: 2, name: "Mak Ngah Peah", relation: "Ibu Saudara", group: "Keluarga Perempuan", rsvp: "hadir", pax: 3, phone: "+60198765432" },
    { id: 3, name: "Siti Nurhaliza", relation: "Rakan Sekolah", group: "Kawan", rsvp: "pending", pax: 2, phone: "+60135555555" },
    { id: 4, name: "Boss Faizal", relation: "Manager", group: "Rakan Kerja", rsvp: "hadir", pax: 1, phone: "+60177777777" },
    { id: 5, name: "Yuna Zarai", relation: "Best Friend", group: "Kawan", rsvp: "hadir", pax: 1, phone: "+60144444444" },
];

const initialGroups: Group[] = [
    { id: "Keluarga Lelaki", label: "Keluarga L", icon: User, color: "text-blue-600 bg-blue-100 border-blue-200" },
    { id: "Keluarga Perempuan", label: "Keluarga P", icon: Heart, color: "text-pink-600 bg-pink-100 border-pink-200" },
    { id: "Kawan", label: "Kawan", icon: Users, color: "text-purple-600 bg-purple-100 border-purple-200" },
    { id: "Rakan Kerja", label: "Rakan Kerja", icon: Briefcase, color: "text-amber-600 bg-amber-100 border-amber-200" },
];

// Presets for new groups
const colorPresets = [
    { name: "Blue", class: "text-blue-600 bg-blue-100 border-blue-200" },
    { name: "Pink", class: "text-pink-600 bg-pink-100 border-pink-200" },
    { name: "Purple", class: "text-purple-600 bg-purple-100 border-purple-200" },
    { name: "Amber", class: "text-amber-600 bg-amber-100 border-amber-200" },
    { name: "Green", class: "text-green-600 bg-green-100 border-green-200" },
    { name: "Teal", class: "text-teal-600 bg-teal-100 border-teal-200" },
    { name: "Rose", class: "text-rose-600 bg-rose-100 border-rose-200" },
    { name: "Indigo", class: "text-indigo-600 bg-indigo-100 border-indigo-200" },
];

const iconPresets = [
    { name: "Users", icon: Users },
    { name: "User", icon: User },
    { name: "Heart", icon: Heart },
    { name: "Briefcase", icon: Briefcase },
    { name: "Star", icon: Star },
    { name: "Home", icon: Home },
];

export default function GuestListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [guests, setGuests] = useState<Guest[]>(initialGuests);
    const [groups, setGroups] = useState<Group[]>(initialGroups);

    // Dialog States
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);

    // Form States
    const [newGuest, setNewGuest] = useState<Partial<Guest>>({
        name: "", relation: "", phone: "", pax: 1, group: ""
    });
    const [editingGroup, setEditingGroup] = useState<Partial<Group> | null>(null);

    const { toast } = useToast();

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Stats
    const totalPax = guests.reduce((acc, curr) => acc + (curr.rsvp === "hadir" ? curr.pax : 0), 0);
    const totalGuests = guests.length;

    const groupStats = groups.map(group => {
        const groupGuests = guests.filter(g => g.group === group.id);
        const groupPax = groupGuests.reduce((acc, curr) => acc + (curr.rsvp === "hadir" ? curr.pax : 0), 0);
        return { ...group, count: groupPax, totalContacts: groupGuests.length };
    });

    // Guest Handlers
    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = Math.max(...guests.map(g => g.id), 0) + 1;
        setGuests([...guests, {
            id: newId,
            name: newGuest.name || "Tetamu",
            relation: newGuest.relation || "-",
            group: newGuest.group || groups[0]?.id || "Lain-lain",
            pax: Number(newGuest.pax) || 1,
            phone: newGuest.phone || "",
            rsvp: "pending"
        }]);
        toast({ title: "Berjaya!", description: "Tetamu baru ditambah.", variant: "success" });
        setNewGuest({ name: "", relation: "", phone: "", pax: 1, group: "" });
        setIsAddGuestOpen(false);
    };

    // Group Handlers
    const handleSaveGroup = () => {
        if (!editingGroup?.label) return;

        if (groups.find(g => g.id === editingGroup.id)) {
            // Edit existing
            setGroups(groups.map(g => g.id === editingGroup.id ? { ...g, ...editingGroup } as Group : g));
            toast({ title: "Disimpan!", description: "Kumpulan dikemaskini.", variant: "success" });
        } else {
            // Add new
            const newGroup = {
                id: editingGroup.label, // Simple ID generation
                label: editingGroup.label,
                icon: editingGroup.icon || Users,
                color: editingGroup.color || colorPresets[0].class
            };
            setGroups([...groups, newGroup]);
            toast({ title: "Berjaya!", description: "Kumpulan baru dicipta.", variant: "success" });
        }
        setEditingGroup(null);
    };

    const handleDeleteGroup = (id: string) => {
        if (groups.length <= 1) {
            toast({ title: "Ralat!", description: "Anda mesti mempunyai sekurang-kurangnya satu kumpulan.", variant: "error" });
            return;
        }
        setGroups(groups.filter(g => g.id !== id));
        // Move guests to the first available group or 'Unassigned' logic if we implemented it
        const fallbackGroup = groups.find(g => g.id !== id)?.id || "";
        setGuests(guests.map(g => g.group === id ? { ...g, group: fallbackGroup } : g));

        toast({ title: "Dihapus!", description: "Kumpulan dipadam.", variant: "default" });
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Senarai Tetamu</h1>
                    <p className="text-muted-foreground">Urus jemputan mengikut kumpulan dan pax.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddGuestOpen(true)} className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 rounded-full px-6">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Tambah Tetamu
                    </Button>
                </div>
            </div>

            {/* Main Stats - Total Pax */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setIsManageGroupsOpen(true)}
                className="cursor-pointer group"
            >
                <Card variant="gradient" className="p-8 text-white relative overflow-hidden border-none shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-[1.01]">
                    <div className="relative z-10">
                        <p className="text-white/80 font-medium mb-2 flex items-center gap-2">
                            Anggaran Kehadiran (Pax)
                            <Settings className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <h2 className="text-5xl font-bold tracking-tight">{totalPax} <span className="text-2xl opacity-60 font-normal">/ {totalGuests} Contact</span></h2>
                        <div className="mt-4 flex gap-2">
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                                Total Confirmed Pax
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 -skew-x-12 translate-x-12" />
                </Card>
            </motion.div>

            {/* Group Summaries */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                    {groupStats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsManageGroupsOpen(true)}
                            className="cursor-pointer"
                        >
                            <Card className={`p-4 border ${stat.color.replace('text-', 'border-').split(' ')[2]} bg-white hover:shadow-lg transition-all h-full hover:scale-[1.02]`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[0]}`} />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {stat.totalContacts}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium truncate mb-0.5">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color.split(' ')[0]}`}>{stat.count}<span className="text-xs text-muted-foreground ml-1 font-medium">pax</span></p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Cari nama, hubungan, atau kumpulan..."
                    className="pl-10 h-12 rounded-2xl bg-white border-border/50 focus:ring-primary/20 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Guest List */}
            <div className="space-y-3">
                {filteredGuests.map((guest, index) => {
                    const groupInfo = groups.find(g => g.id === guest.group) || groups[0];
                    return (
                        <motion.div
                            key={guest.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-lg transition-all border-border/40 group bg-white/80 backdrop-blur-sm">
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Avatar */}
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${groupInfo.color.split(' ')[1]} ${groupInfo.color.split(' ')[0]}`}>
                                        {guest.name.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">{guest.name}</h4>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${groupInfo.color.replace('text-', 'bg-').split(' ')[0]}`} />
                                                {groupInfo.label}
                                            </span>
                                            <span className="text-border">•</span>
                                            <span>{guest.relation}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Pax */}
                                <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pl-16 md:pl-0">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Pax</p>
                                        <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full text-foreground font-bold">
                                            <Users className="h-3 w-3" />
                                            {guest.pax}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => window.open(`https://wa.me/${guest.phone.replace(/\+/g, '')}`)} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-green-600 hover:bg-green-50 bg-green-50/50">
                                            <MessageCircle className="h-5 w-5" />
                                        </Button>
                                        <Button onClick={() => window.open(`tel:${guest.phone}`)} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-blue-600 hover:bg-blue-50 bg-blue-50/50">
                                            <Phone className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Guest Dialog */}
            <Dialog isOpen={isAddGuestOpen} onClose={() => setIsAddGuestOpen(false)} title="Tambah Tetamu Baru">
                <form onSubmit={handleAddGuest} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nama Penuh</label>
                        <Input
                            value={newGuest.name}
                            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                            placeholder="Contoh: Ali Bin Abu"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Hubungan</label>
                            <Input
                                value={newGuest.relation}
                                onChange={(e) => setNewGuest({ ...newGuest, relation: e.target.value })}
                                placeholder="Contoh: Sepupu"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">No. Telefon</label>
                            <Input
                                type="tel"
                                value={newGuest.phone}
                                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                                placeholder="+601..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Kumpulan Undangan</label>
                            <div className="relative">
                                <select
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    value={newGuest.group}
                                    onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value })}
                                >
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.label}</option>
                                    ))}
                                </select>
                                <Users className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Jumlah Pax</label>
                            <Input
                                type="number"
                                min="1"
                                value={newGuest.pax}
                                onChange={(e) => setNewGuest({ ...newGuest, pax: parseInt(e.target.value) })}
                                placeholder="1"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                        Simpan Tetamu
                    </Button>
                </form>
            </Dialog>

            {/* Manage Groups Dialog */}
            <Dialog isOpen={isManageGroupsOpen} onClose={() => { setIsManageGroupsOpen(false); setEditingGroup(null); }} title={editingGroup ? (editingGroup.id ? "Kemaskini Kumpulan" : "Tambah Kumpulan") : "Urus Kumpulan Undangan"}>
                <div className="space-y-6">
                    {editingGroup ? (
                        /* Add/Edit Form View */
                        <div className="space-y-4">
                            <div className="bg-secondary/20 p-4 rounded-xl border border-secondary space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nama Kumpulan</label>
                                        <Input
                                            value={editingGroup.label || ""}
                                            onChange={(e) => setEditingGroup({ ...editingGroup, label: e.target.value })}
                                            placeholder="Contoh: Jiran Tetangga"
                                            className="bg-white"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Color Selection */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1"><Palette className="h-3 w-3" /> Tema Warna</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    onClick={() => setEditingGroup({ ...editingGroup, color: preset.class })}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all ${preset.class.split(' ')[1]} ${editingGroup.color === preset.class ? 'border-foreground scale-110 shadow-md' : 'border-transparent'}`}
                                                    title={preset.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Icon Selection */}
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1"><Star className="h-3 w-3" /> Ikon</label>
                                        <div className="flex gap-3">
                                            {iconPresets.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    onClick={() => setEditingGroup({ ...editingGroup, icon: preset.icon })}
                                                    className={`p-2 rounded-md border transition-all ${editingGroup.icon === preset.icon ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border text-muted-foreground hover:bg-muted'}`}
                                                    title={preset.name}
                                                >
                                                    <preset.icon className="h-4 w-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleSaveGroup} disabled={!editingGroup.label} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                                            {editingGroup.id ? "Simpan Perubahan" : "Simpan Kumpulan"}
                                        </Button>
                                        <Button onClick={() => setEditingGroup(null)} variant="outline" className="flex-1">
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Group List View */
                        <div className="space-y-2">
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {groups.map((group) => (
                                    <div key={group.id} className="flex items-center justify-between p-3 bg-white border border-border/50 rounded-lg shadow-sm hover:border-primary/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-md ${group.color} bg-opacity-20`}>
                                                <group.icon className={`h-4 w-4 ${group.color.split(' ')[0]}`} />
                                            </div>
                                            <span className="font-medium text-sm text-foreground">{group.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => setEditingGroup(group)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Group Row */}
                                <button
                                    onClick={() => setEditingGroup({ label: "", color: colorPresets[0].class, icon: Users })}
                                    className="w-full flex items-center gap-3 p-3 bg-white border border-dashed border-border rounded-lg hover:bg-muted/30 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary group"
                                >
                                    <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-sm">Tambah Kumpulan Baru</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
