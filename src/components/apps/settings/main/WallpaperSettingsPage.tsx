"use client";

import React from "react";
import { ChevronLeft, Image as ImageIcon, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

const WALLPAPERS = [
    { id: "glass", name: "Dynamic Glass", colors: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" },
    { id: "ocean", name: "Deep Ocean", colors: "bg-gradient-to-br from-blue-900 to-emerald-900" },
    { id: "sunset", name: "Cyber Sunset", colors: "bg-gradient-to-br from-orange-600 to-rose-900" },
    { id: "dark", name: "Pure Dark", colors: "bg-black" },
    { id: "minimal", name: "Minimal Grey", colors: "bg-slate-300 dark:bg-slate-900" },
];

export default function WallpaperSettingsPage({
    onClose,
    selectedId,
    onSelect
}: {
    onClose: () => void,
    selectedId: string,
    onSelect: (id: string) => void
}) {
    const handleSelect = async (id: string) => {
        onSelect(id);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("profiles").update({ wallpaper_id: id }).eq("id", user.id);
        }
    };

    return (
        <div className="flex flex-col h-full text-foreground p-6 pt-12">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 flex items-center gap-1 text-sm font-bold opacity-50"
            >
                <ChevronLeft size={20} /> 戻る
            </button>

            <header className="mb-8">
                <h2 className="text-2xl font-black">壁紙設定</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Wallpaper & Atmosphere</p>
            </header>

            <div className="grid grid-cols-2 gap-4 pb-12">
                {WALLPAPERS.map((wp) => (
                    <button
                        key={wp.id}
                        onClick={() => handleSelect(wp.id)}
                        className="flex flex-col gap-2 group text-left"
                    >
                        <div className={cn(
                            "w-full aspect-[9/16] rounded-2xl shadow-xl transition-all duration-300 glossy-border relative overflow-hidden",
                            wp.colors,
                            selectedId === wp.id ? "ring-4 ring-indigo-500 ring-offset-4 ring-offset-background scale-95" : "hover:scale-105"
                        )}>
                            {selectedId === wp.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                                    <div className="bg-indigo-500 p-2 rounded-full text-white shadow-lg">
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{wp.name}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
