"use client";

import React from "react";
import { ChevronLeft, Camera, User, Mail, Save, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const EMOJIS = ["👤", "🐱", "🐶", "🦊", "🐻", "🐼", "🐨", "🦁", "🐧", "🦄", "🌈", "🔥", "🚀", "🎮", "💡"];

export default function ProfileEditPage({
    onClose,
    avatarEmoji,
    onUpdateEmoji,
    weatherCity,
    onUpdateCity
}: {
    onClose: () => void,
    avatarEmoji: string,
    onUpdateEmoji: (emoji: string) => void,
    weatherCity: string,
    onUpdateCity: (city: string) => void
}) {
    const [name, setName] = React.useState("User");
    const [localCity, setLocalCity] = React.useState(weatherCity);
    const [loading, setLoading] = React.useState(false);

    const handleSave = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("profiles").update({
                avatar_emoji: avatarEmoji,
                weather_city: localCity
            }).eq("id", user.id);
            onUpdateCity(localCity);
        }
        setLoading(false);
        onClose();
    };

    return (
        <div className="flex flex-col h-full text-foreground p-6 pt-12 bg-background">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 flex items-center gap-1 text-sm font-bold opacity-50"
            >
                <ChevronLeft size={20} /> 戻る
            </button>

            <header className="mb-4">
                <h2 className="text-2xl font-black">プロフィール編集</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Edit Profile</p>
            </header>

            <div className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center text-4xl shadow-xl glass glossy-border">
                        {avatarEmoji}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {EMOJIS.map(e => (
                            <button
                                key={e}
                                onClick={() => onUpdateEmoji(e)}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90",
                                    avatarEmoji === e ? "bg-indigo-500 scale-110 shadow-lg text-white" : "bg-foreground/5 hover:bg-foreground/10"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black opacity-30 ml-2">表示名</label>
                        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3">
                            <User size={18} className="opacity-30" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none outline-none w-full font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-center">
                        <label className="text-[10px] uppercase font-black opacity-30">天気予報の地域</label>
                        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3">
                            <MapPin size={18} className="opacity-30" />
                            <input
                                type="text"
                                value={localCity}
                                onChange={(e) => setLocalCity(e.target.value)}
                                className="bg-transparent border-none outline-none w-full font-bold text-center"
                                placeholder="Tokyo, Kobe, etc."
                            />
                        </div>
                        <p className="text-[9px] opacity-40 font-bold italic tracking-tighter">「現在地」または「Auto」で自動取得</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? "保存中..." : <><Save size={18} /> 変更を保存</>}
                </button>
            </div>
        </div>
    );
}
