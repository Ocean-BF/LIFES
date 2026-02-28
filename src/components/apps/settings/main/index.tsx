"use client";

import React from "react";
import {
    Moon,
    Sun,
    Smartphone,
    User,
    Bell,
    Shield,
    ChevronRight,
    LogOut,
    Monitor
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SettingsPage({
    onOpenAdmin,
    isAdmin,
    onNavigate
}: {
    onOpenAdmin: () => void,
    isAdmin: boolean,
    onNavigate: (page: string) => void
}) {
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="flex flex-col h-full text-foreground px-1 pb-24">
            <header className="mb-6 p-4">
                <h2 className="text-3xl font-black tracking-tight">設定</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">System Preferences</p>
            </header>

            <div className="space-y-8">
                {/* 1. システム管理（管理者のみ・最上部） */}
                {isAdmin && (
                    <section>
                        <div className="text-[10px] font-black uppercase opacity-30 ml-4 mb-2 tracking-widest">Administrator</div>
                        <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl shadow-indigo-500/5">
                            <button
                                onClick={onOpenAdmin}
                                className="w-full flex items-center justify-between p-5 hover:bg-indigo-500/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-active:scale-90 transition-transform">
                                        <Shield size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-sm block">管理パネル</span>
                                        <span className="text-[9px] opacity-40 uppercase tracking-tighter">Manage OS Assets</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </section>
                )}

                {/* 2. アカウント情報 */}
                <section>
                    <div className="text-[10px] font-black uppercase opacity-30 ml-4 mb-2 tracking-widest">Account</div>
                    <div className="glass rounded-[2rem] overflow-hidden border-white/5">
                        <SettingsRow
                            icon={<User size={18} />}
                            label="プロフィール編集"
                            onClick={() => onNavigate("profile")}
                        />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-5 hover:bg-red-500/10 transition-all text-red-500"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <LogOut size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-sm block">ログアウト</span>
                                    <span className="text-[9px] opacity-40 uppercase tracking-tighter">Sign Out Session</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* 3. 一般設定（通知・テーマ・壁紙） */}
                <section>
                    <div className="text-[10px] font-black uppercase opacity-30 ml-4 mb-2 tracking-widest">General</div>
                    <div className="glass rounded-[2rem] overflow-hidden border-white/5">
                        <SettingsRow
                            icon={<Bell size={18} />}
                            label="通知設定"
                            onClick={() => onNavigate("notifications")}
                        />

                        <div className="flex items-center justify-between p-5 border-b border-foreground/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-sm block">テーマモード</span>
                                    <span className="text-[9px] opacity-40 uppercase tracking-tighter">{theme} mode active</span>
                                </div>
                            </div>
                            <div className="flex bg-foreground/5 p-1 rounded-full border border-foreground/5">
                                {[
                                    { id: "light", icon: Sun },
                                    { id: "dark", icon: Moon },
                                    { id: "system", icon: Monitor }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setTheme(item.id)}
                                        className={cn(
                                            "p-1.5 rounded-full transition-all",
                                            theme === item.id ? "bg-white text-black shadow-lg" : "text-foreground/40"
                                        )}
                                    >
                                        <item.icon size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SettingsRow
                            icon={<Smartphone size={18} />}
                            label="壁紙設定"
                            onClick={() => onNavigate("wallpaper")}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function SettingsRow({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between p-5 border-b border-foreground/5 last:border-none hover:bg-foreground/5 transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center opacity-70 group-active:scale-95 transition-transform">
                    {icon}
                </div>
                <span className="font-bold text-sm">{label}</span>
            </div>
            <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
