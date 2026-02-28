"use client";

import React, { useState, useEffect } from "react";
import {
    Home,
    ShoppingBag,
    Activity,
    BookOpen,
    Gamepad2,
    Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Tab = "home" | "life" | "health" | "learning" | "play" | "settings";

export default function OSContainer() {
    const [activeTab, setActiveTab] = useState<Tab>("home");
    const [bgImage, setBgImage] = useState<string>("");
    const [bgColor, setBgColor] = useState<string>("from-indigo-900 via-purple-900 to-pink-900");

    useEffect(() => {
        // ローカルストレージから設定を読み込む（後ほど実装）
    }, []);

    const navItems = [
        { id: "home", label: "ホーム", icon: Home },
        { id: "life", label: "生活", icon: ShoppingBag },
        { id: "health", label: "健康", icon: Activity },
        { id: "learning", label: "学習", icon: BookOpen },
        { id: "play", label: "遊び", icon: Gamepad2 },
        { id: "settings", label: "設定", icon: Settings },
    ];

    return (
        <div className={cn(
            "relative h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br",
            bgColor
        )}>
            {/* 背景画像がある場合 */}
            {bgImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}

            {/* メインコンテンツエリア */}
            <main className="flex-1 relative z-10 p-4 pt-12 ios-scroll">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {activeTab === "home" && <HomeScreen />}
                        {activeTab !== "home" && (
                            <div className="flex flex-col items-center justify-center p-8 glass rounded-3xl min-h-[400px]">
                                <p className="text-xl font-medium opacity-80">
                                    {navItems.find(n => n.id === activeTab)?.label}
                                </p>
                                <p className="text-sm opacity-50 mt-2">Coming Soon...</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ボトムナビゲーション */}
            <nav className="relative z-20 pb-8 px-4 pt-2">
                <div className="max-w-md mx-auto glass rounded-2xl flex items-center justify-around p-2 gap-1 shadow-2xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 flex-1",
                                    isActive ? "bg-white/20 text-white scale-110" : "text-white/60 hover:text-white/80"
                                )}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

function HomeScreen() {
    // アイコンのリスト（後ほど動的に取得）
    const apps = [
        { title: "買い物", icon: "🛒", category: "life" },
        { title: "読書ログ", icon: "📚", category: "learning" },
        { title: "歩数計", icon: "🚶", category: "health" },
        { title: "映画メモ", icon: "🎬", category: "play" },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* ウィジェットエリア */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-3xl aspect-square flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium opacity-70">Weather</span>
                        <span className="text-sm opacity-70">Tokyo</span>
                    </div>
                    <div>
                        <div className="text-4xl font-light">12°</div>
                        <div className="text-sm opacity-70">晴れ</div>
                    </div>
                </div>
                <div className="glass p-4 rounded-3xl aspect-square flex flex-col justify-between">
                    <div className="text-sm font-medium opacity-70">Coming soon Widget</div>
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                </div>
            </div>

            {/* アプリアイコンエリア */}
            <div className="grid grid-cols-4 gap-y-6">
                {apps.map((app, i) => (
                    <motion.div
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-1.5"
                    >
                        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/10">
                            {app.icon}
                        </div>
                        <span className="text-[11px] font-medium text-white/90 truncate w-16 text-center">
                            {app.title}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
