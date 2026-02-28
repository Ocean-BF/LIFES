"use client";

import React from "react";
import { ChevronLeft, Bell, BellOff, MessageSquare, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationSettingsPage({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex flex-col h-full text-foreground p-6 pt-12 bg-background">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 flex items-center gap-1 text-sm font-bold opacity-50"
            >
                <ChevronLeft size={20} /> 戻る
            </button>

            <header className="mb-8">
                <h2 className="text-2xl font-black">通知設定</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Notification Preferences</p>
            </header>

            <div className="space-y-6">
                <section className="glass rounded-[2rem] overflow-hidden border-white/5">
                    <ToggleRow icon={<Bell size={18} />} label="アプリ内通知を許可" initialValue={true} />
                    <ToggleRow icon={<MessageSquare size={18} />} label="メッセージ受信通知" initialValue={true} />
                    <ToggleRow icon={<AlertCircle size={18} />} label="底値の更新アラート" initialValue={true} />
                </section>

                <section className="p-4 glass rounded-2xl bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-start gap-3">
                        <Info className="text-amber-500 mt-1" size={16} />
                        <p className="text-xs text-amber-500/80 leading-relaxed">
                            プッシュ通知を有効にするには、スマートフォンの設定からブラウザの通知許可も必要です。
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ToggleRow({ icon, label, initialValue }: { icon: React.ReactNode, label: string, initialValue: boolean }) {
    const [enabled, setEnabled] = React.useState(initialValue);

    return (
        <div className="flex items-center justify-between p-4 border-b border-foreground/5 last:border-none">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center opacity-60">
                    {icon}
                </div>
                <span className="font-bold text-sm">{label}</span>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner",
                    enabled ? "bg-indigo-500" : "bg-foreground/10"
                )}
            >
                <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
                    enabled ? "left-7" : "left-1"
                )} />
            </button>
        </div>
    );
}

// ユーティリティ内包 (import簡略化のため)
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
