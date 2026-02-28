"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    ShieldCheck,
    Plus,
    Trash2,
    Save,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Database,
    Smartphone,
    Layout
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AppRecord {
    id: string;
    title: string;
    category: string;
    path: string;
    icon_value: string;
    sort_order: number;
}

export default function AdminPage({
    onClose,
    onRefresh
}: {
    onClose: () => void,
    onRefresh?: () => void
}) {
    const [apps, setApps] = useState<AppRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New App Form State
    const [newApp, setNewApp] = useState({
        title: "",
        category: "life",
        path: "",
        icon_value: "✨",
        sort_order: 0
    });

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("apps")
            .select("*")
            .order("category", { ascending: true })
            .order("sort_order", { ascending: true });
        if (data) setApps(data);
        setLoading(false);
        if (onRefresh) onRefresh();
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from("apps").insert([newApp]);
        if (!error) {
            setNewApp({ title: "", category: "life", path: "", icon_value: "✨", sort_order: 0 });
            fetchApps();
        }
        setSaving(false);
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm("このアプリを削除してもよろしいですか？")) return;
        const { error } = await supabase.from("apps").delete().eq("id", id);
        if (!error) fetchApps();
    };

    const handleMoveApp = async (app: AppRecord, direction: "up" | "down") => {
        // 同じカテゴリのアプリを取得して現在の順序（sort_order）で並べる
        const catApps = [...apps.filter(a => a.category === app.category)];
        const index = catApps.findIndex(a => a.id === app.id);

        if (direction === "up" && index > 0) {
            // 配列内で位置を入れ替え
            [catApps[index - 1], catApps[index]] = [catApps[index], catApps[index - 1]];
        } else if (direction === "down" && index < catApps.length - 1) {
            // 配列内で位置を入れ替え
            [catApps[index], catApps[index + 1]] = [catApps[index + 1], catApps[index]];
        } else {
            return;
        }

        // 新しい並び順に基づいて sort_order を 0, 1, 2... と振り直してDB更新
        const updates = catApps.map((a, idx) =>
            supabase.from("apps").update({ sort_order: idx }).eq("id", a.id)
        );

        await Promise.all(updates);
        fetchApps(); // DB更新後に再取得して表示に反映
    };

    const [editingAppId, setEditingAppId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AppRecord>>({});

    const handleUpdateApp = async (id: string) => {
        setSaving(true);
        const { error } = await supabase.from("apps").update(editForm).eq("id", id);
        if (!error) {
            setEditingAppId(null);
            fetchApps();
        }
        setSaving(false);
    };

    const categories = ["home", "life", "health", "learning", "play", "settings"];

    return (
        <div className="flex flex-col h-full text-foreground">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-indigo-500" /> 管理パネル
                    </h2>
                    <p className="text-xs opacity-50 uppercase tracking-widest mt-1">System Administration</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 新規アプリ登録 */}
                <section className="glass p-6 rounded-3xl border-white/10">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 opacity-70">
                        <Plus size={16} /> アプリを新規登録
                    </h3>
                    <form onSubmit={handleCreateApp} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] uppercase font-bold opacity-40 ml-1">アプリ名</label>
                            <input
                                value={newApp.title}
                                onChange={e => setNewApp({ ...newApp, title: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500/50"
                                placeholder="例：買い物メモ"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] uppercase font-bold opacity-40 ml-1">カテゴリ</label>
                            <select
                                value={newApp.category}
                                onChange={e => setNewApp({ ...newApp, category: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 mt-1 focus:outline-none appearance-none"
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-background text-foreground">{c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] uppercase font-bold opacity-40 ml-1">実行パス</label>
                            <input
                                value={newApp.path}
                                onChange={e => setNewApp({ ...newApp, path: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 mt-1 focus:outline-none"
                                placeholder="/life/memo"
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-1">
                            <label className="text-[10px] uppercase font-bold opacity-40 ml-1">アイコン (絵文字)</label>
                            <input
                                value={newApp.icon_value}
                                onChange={e => setNewApp({ ...newApp, icon_value: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 mt-1 focus:outline-none text-center text-xl"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving || !newApp.title || !newApp.path}
                            className="col-span-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            {saving ? "登録中..." : "アプリをシステムに追加"}
                        </button>
                    </form>
                </section>

                {/* アプリ一覧管理 */}
                <section>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 opacity-70">
                        <Layout size={16} /> 登録済みアプリの管理
                    </h3>
                    <div className="space-y-3">
                        {categories.map(cat => {
                            const catApps = apps.filter(a => a.category === cat);
                            if (catApps.length === 0) return null;
                            return (
                                <div key={cat} className="space-y-2">
                                    <div className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-tighter">{cat}</div>
                                    {catApps.map((app, idx) => {
                                        const isEditing = editingAppId === app.id;
                                        return (
                                            <div key={app.id} className="glass px-4 py-3 rounded-2xl border-white/5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="flex flex-col gap-1 mr-1">
                                                            <button
                                                                onClick={() => handleMoveApp(app, "up")}
                                                                disabled={idx === 0 || isEditing}
                                                                className="p-1 hover:bg-foreground/10 rounded transition-all disabled:opacity-10 cursor-pointer"
                                                            >
                                                                <ChevronUp size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMoveApp(app, "down")}
                                                                disabled={idx === catApps.length - 1 || isEditing}
                                                                className="p-1 hover:bg-foreground/10 rounded transition-all disabled:opacity-10 cursor-pointer"
                                                            >
                                                                <ChevronDown size={14} />
                                                            </button>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="flex-1 grid grid-cols-6 gap-2 items-end">
                                                                <div className="col-span-1">
                                                                    <input
                                                                        value={editForm.icon_value}
                                                                        onChange={e => setEditForm({ ...editForm, icon_value: e.target.value })}
                                                                        className="w-full bg-foreground/5 border border-indigo-500/50 rounded-lg px-2 py-1 text-center text-lg"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        value={editForm.title}
                                                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                                        className="w-full bg-foreground/5 border border-indigo-500/50 rounded-lg px-2 py-1 text-xs font-bold"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input
                                                                        value={editForm.path}
                                                                        onChange={e => setEditForm({ ...editForm, path: e.target.value })}
                                                                        className="w-full bg-foreground/5 border border-indigo-500/50 rounded-lg px-2 py-1 text-[10px] opacity-60"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-2xl">{app.icon_value}</span>
                                                                <div>
                                                                    <div className="font-bold text-sm">{app.title}</div>
                                                                    <div className="text-[10px] opacity-40">{app.path}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateApp(app.id)}
                                                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all"
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingAppId(null)}
                                                                    className="p-2 opacity-30 hover:opacity-100 rounded-full transition-all"
                                                                >
                                                                    取消
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingAppId(app.id);
                                                                        setEditForm(app);
                                                                    }}
                                                                    className="p-2 opacity-30 hover:opacity-100 hover:bg-foreground/5 rounded-full transition-all"
                                                                >
                                                                    修正
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteApp(app.id)}
                                                                    className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
