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
import { cn } from "@/lib/utils"; // ユーティリティ関数が必要になるので後で作ります
import { supabase } from "@/lib/supabase";
import BottomPriceChecker from "./apps/life/bottom-price";
import PriceComparator from "./apps/life/price-comparator";
import SharedCalendar from "./apps/life/calendar";
import SettingsPage from "./apps/settings/main";
import AdminPage from "./apps/settings/main/AdminPage";
import ProfileEditPage from "./apps/settings/main/ProfileEditPage";
import NotificationSettingsPage from "./apps/settings/main/NotificationSettingsPage";
import WallpaperSettingsPage from "./apps/settings/main/WallpaperSettingsPage";
import { AppWindow, ChevronLeft, Star } from "lucide-react";
import HomeWidgets from "./widgets/HomeWidgets";
import ClockWidget from "./widgets/ClockWidget";

const WALLPAPERS: Record<string, string> = {
    glass: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    ocean: "bg-gradient-to-br from-blue-900 to-emerald-900",
    sunset: "bg-gradient-to-br from-orange-600 to-rose-900",
    dark: "bg-black",
    minimal: "bg-slate-300 dark:bg-slate-900",
};

type Tab = "home" | "life" | "health" | "learning" | "play" | "settings";

interface AppData {
    id: string;
    title: string;
    icon_type: string;
    icon_value: string;
    category: string;
    path: string;
}

export default function OSContainer() {
    const [activeTab, setActiveTab] = useState<Tab>("home");
    const [apps, setApps] = useState<AppData[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]); // app_ids
    const [loading, setLoading] = useState(true);
    const [openAppPath, setOpenAppPath] = useState<string | null>(null);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeSettingsSubPage, setActiveSettingsSubPage] = useState<string | null>(null);
    const [wallpaper, setWallpaper] = useState("glass");
    const [avatarEmoji, setAvatarEmoji] = useState("👤");
    const [weatherCity, setWeatherCity] = useState("Tokyo");

    useEffect(() => {
        fetchAppsAndFavorites();
        checkAdminStatus();
    }, []);

    async function checkAdminStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // カラムがまだ存在しない場合のエラーを避けるため、個別に取得するか、
        // 全体を取得して存在する値だけをセットするようにします
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (data) {
            // カラムが存在する場合のみ値をセット
            if (data.is_admin !== undefined) setIsAdmin(data.is_admin);
            if (data.wallpaper_id) setWallpaper(data.wallpaper_id);
            if (data.avatar_emoji) setAvatarEmoji(data.avatar_emoji);
            if (data.weather_city) setWeatherCity(data.weather_city);
        } else if (error) {
            console.error("Admin check error:", error);
            // エラーが発生しても、フォールバックとして管理者権限を再確認するなどの
            // 処理が必要な場合がありますが、まずはDBの更新を優先してください
        }
    }

    const fetchAppsAndFavorites = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        // アプリ一覧取得
        const { data: appsData } = await supabase
            .from("apps")
            .select("*")
            .order("sort_order", { ascending: true });

        // お気に入り取得
        if (user) {
            const { data: favData } = await supabase
                .from("favorites")
                .select("app_id")
                .eq("user_id", user.id);

            if (favData) setFavorites(favData.map(f => f.app_id));
        }

        if (appsData) setApps(appsData);
        setLoading(false);
    };

    const navItems = [
        { id: "home", label: "ホーム", icon: Home },
        { id: "life", label: "生活", icon: ShoppingBag },
        { id: "health", label: "健康", icon: Activity },
        { id: "learning", label: "学習", icon: BookOpen },
        { id: "play", label: "遊び", icon: Gamepad2 },
        { id: "settings", label: "設定", icon: Settings },
    ];

    const filteredApps = activeTab === "home"
        ? apps.filter(app => favorites.includes(app.id))
        : apps.filter(app => app.category === activeTab);

    return (
        <div className={cn(
            "relative h-[100dvh] w-full flex flex-col overflow-hidden transition-all duration-700",
            WALLPAPERS[wallpaper] || WALLPAPERS.glass
        )}>
            {/* バックグラウンドのオーバーレイ（ダークモード等で少し暗くし、視認性を確保） */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/50 pointer-events-none z-0" />
            {/* メインコンテンツエリア */}
            <main className="flex-1 relative z-10 p-4 pt-12 overflow-y-auto ios-scroll">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full opacity-30">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {activeTab === "settings" ? (
                                    <div className="relative h-full w-full">
                                        <AnimatePresence mode="wait">
                                            {!activeSettingsSubPage ? (
                                                <motion.div
                                                    key="main-settings"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                                                    className="w-full"
                                                >
                                                    <SettingsPage
                                                        onOpenAdmin={() => isAdmin && setIsAdminPanelOpen(true)}
                                                        isAdmin={isAdmin}
                                                        onNavigate={(page) => setActiveSettingsSubPage(page)}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="settings-sub"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                                                    className="w-full h-full"
                                                >
                                                    {activeSettingsSubPage === "profile" && (
                                                        <ProfileEditPage
                                                            avatarEmoji={avatarEmoji}
                                                            onUpdateEmoji={(emoji) => setAvatarEmoji(emoji)}
                                                            onClose={() => setActiveSettingsSubPage(null)}
                                                            weatherCity={weatherCity}
                                                            onUpdateCity={(city) => setWeatherCity(city)}
                                                        />
                                                    )}
                                                    {activeSettingsSubPage === "notifications" && <NotificationSettingsPage onClose={() => setActiveSettingsSubPage(null)} />}
                                                    {activeSettingsSubPage === "wallpaper" && (
                                                        <WallpaperSettingsPage
                                                            selectedId={wallpaper}
                                                            onSelect={(id) => setWallpaper(id)}
                                                            onClose={() => setActiveSettingsSubPage(null)}
                                                        />
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === "home" && (
                                            <div className="flex flex-col gap-2">
                                                <ClockWidget />
                                                <HomeWidgets city={weatherCity} />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 gap-y-6">
                                            {filteredApps.map((app) => (
                                                <AppIcon
                                                    key={app.id}
                                                    app={app}
                                                    isFavorite={favorites.includes(app.id)}
                                                    onToggleFavorite={() => toggleFavorite(app.id)}
                                                    onClick={() => setOpenAppPath(app.path)}
                                                />
                                            ))}
                                            {filteredApps.length === 0 && (
                                                <div className="col-span-4 text-center py-12 opacity-30 text-sm italic">
                                                    アプリがありません
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ボトムナビゲーション */}
            <nav className="relative z-20 pb-8 px-4 pt-2">
                <div className="max-w-md mx-auto glass glossy-border rounded-2xl flex items-center justify-around p-2 gap-1 shadow-2xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className="flex-1 flex items-center justify-center"
                            >
                                <div className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300",
                                    isActive ? "bg-white/20 text-white scale-110 shadow-lg" : "text-white/60 hover:text-white/90"
                                )}>
                                    <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                                    <span className="text-[10px] font-black mt-1 uppercase tracking-tight">{item.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* アプリ・パネルのレンダリング */}
            <AnimatePresence>
                {openAppPath === "/life/bottom-price" && (
                    <BottomPriceChecker onClose={() => setOpenAppPath(null)} />
                )}

                {openAppPath === "/life/price-compare" && (
                    <PriceComparator onClose={() => setOpenAppPath(null)} />
                )}

                {openAppPath === "/life/calendar" && (
                    <SharedCalendar onClose={() => setOpenAppPath(null)} />
                )}

                {isAdminPanelOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-background p-6 pt-12"
                    >
                        <button
                            onClick={() => setIsAdminPanelOpen(false)}
                            className="absolute top-4 left-4 flex items-center gap-1 text-sm font-bold opacity-50"
                        >
                            <ChevronLeft size={20} /> 戻る
                        </button>
                        <div className="h-full overflow-y-auto pb-12">
                            <AdminPage
                                onClose={() => setIsAdminPanelOpen(false)}
                                onRefresh={fetchAppsAndFavorites}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    async function toggleFavorite(appId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (favorites.includes(appId)) {
            await supabase.from("favorites").delete().eq("user_id", user.id).eq("app_id", appId);
            setFavorites(prev => prev.filter(id => id !== appId));
        } else {
            await supabase.from("favorites").insert({ user_id: user.id, app_id: appId });
            setFavorites(prev => [...prev, appId]);
        }
    }
}


function AppIcon({ app, isFavorite, onToggleFavorite, onClick }: { app: AppData, isFavorite: boolean, onToggleFavorite: () => void, onClick: () => void }) {
    return (
        <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 relative group cursor-pointer"
        >
            <div className="w-16 h-16 glass glossy-border rounded-2xl flex items-center justify-center text-3xl shadow-2xl backdrop-blur-xl">
                {app.icon_value}
            </div>
            <span className="text-[12px] font-black text-white drop-shadow-md tracking-tight text-center px-1">
                {app.title}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className={cn(
                    "absolute -top-1 -right-1 w-6 h-6 rounded-full glass border-white/20 flex items-center justify-center transition-all",
                    isFavorite ? "text-yellow-400 opacity-100 scale-110" : "text-foreground/20 opacity-0 group-hover:opacity-100"
                )}
            >
                <Star size={12} fill={isFavorite ? "currentColor" : "none"} />
            </button>
        </motion.div>
    );
}
