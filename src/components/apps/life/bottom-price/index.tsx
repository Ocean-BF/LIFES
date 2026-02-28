"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Plus,
    History,
    ChevronDown,
    Search,
    Trash2,
    TrendingDown,
    Store,
    Tag
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface PriceRecord {
    id: string;
    item_name: string;
    category: string;
    price: number;
    quantity: number;
    volume: number;
    unit_price: number;
    shop_name: string;
    created_at: string;
}

export default function BottomPriceChecker({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"form" | "history">("form");
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<PriceRecord[]>([]);

    // Form State
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [volume, setVolume] = useState("1");
    const [shopName, setShopName] = useState("");
    const [status, setStatus] = useState("");

    const unitPrice = useMemo(() => {
        const p = parseFloat(price);
        const q = parseFloat(quantity) || 1;
        const v = parseFloat(volume) || 1;
        if (!isNaN(p) && q > 0 && v > 0) {
            return (p / q / v).toFixed(2);
        }
        return null;
    }, [price, quantity, volume]);

    // リアルタイム比較用のデータ
    const currentComparison = useMemo(() => {
        if (!itemName) return null;
        const sameItems = records.filter(r =>
            r.item_name.toLowerCase().includes(itemName.toLowerCase())
        );
        if (sameItems.length === 0) return null;

        // 最安値を見つける
        const cheapest = [...sameItems].sort((a, b) => a.unit_price - b.unit_price)[0];
        return {
            bestPrice: cheapest.unit_price,
            store: cheapest.shop_name,
            count: sameItems.length
        };
    }, [itemName, records]);

    // 商品ごとの最安店トップ3
    const topStoresByItem = useMemo(() => {
        const grouped: Record<string, PriceRecord[]> = {};
        records.forEach(r => {
            if (!grouped[r.item_name]) grouped[r.item_name] = [];
            grouped[r.item_name].push(r);
        });

        const result: Record<string, { shop_name: string, unit_price: number }[]> = {};
        Object.keys(grouped).forEach(item => {
            const sorted = grouped[item].sort((a, b) => a.unit_price - b.unit_price);
            // 同じ店が並ばないようにユニークにする
            const uniqueStores: { shop_name: string, unit_price: number }[] = [];
            const seenStores = new Set();
            for (const s of sorted) {
                if (!seenStores.has(s.shop_name)) {
                    uniqueStores.push({ shop_name: s.shop_name, unit_price: s.unit_price });
                    seenStores.add(s.shop_name);
                }
                if (uniqueStores.length >= 3) break;
            }
            result[item] = uniqueStores;
        });
        return result;
    }, [records]);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        const { data } = await supabase
            .from("bottom_prices")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setRecords(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName || !price || !unitPrice) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("bottom_prices").insert([
            {
                user_id: user.id,
                item_name: itemName,
                category: category,
                price: parseInt(price),
                quantity: parseFloat(quantity),
                volume: parseFloat(volume),
                unit_price: parseFloat(unitPrice),
                shop_name: shopName,
            },
        ]);

        if (error) {
            setStatus("エラーが発生しました");
        } else {
            setStatus("記録しました！");
            setItemName("");
            setPrice("");
            setShopName("");
            fetchRecords();
            setTimeout(() => setStatus(""), 3000);
        }
        setLoading(false);
    };

    const handleTaxAction = (type: "in" | "out") => {
        const p = parseFloat(price);
        if (isNaN(p)) return;
        if (type === "in") setPrice(Math.round(p * 1.1).toString());
        if (type === "out") setPrice(Math.round(p / 1.1).toString());
    };

    const deleteRecord = async (id: string) => {
        const { error } = await supabase.from("bottom_prices").delete().eq("id", id);
        if (!error) fetchRecords();
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
        >
            {/* 閉じるボタンとタイトル */}
            <header className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass glossy-border rounded-xl flex items-center justify-center text-xl shadow-inner border-white/30">
                        📉
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-none">底値チェッカー</h1>
                        <p className="text-[10px] text-foreground/50 tracking-wider">BOTTOM PRICE CHECKER</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/70 hover:bg-foreground/20 transition-colors"
                >
                    <X size={20} />
                </button>
            </header>

            {/* タブ切り替え */}
            <div className="flex p-4 gap-2">
                <button
                    onClick={() => setActiveTab("form")}
                    className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                        activeTab === "form" ? "bg-foreground/10 text-foreground shadow-lg" : "text-foreground/40 hover:text-foreground/60"
                    )}
                >
                    <Plus size={16} /> 入力
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                        activeTab === "history" ? "bg-foreground/10 text-foreground shadow-lg" : "text-foreground/40 hover:text-foreground/60"
                    )}
                >
                    <History size={16} /> 履歴
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-24">
                <AnimatePresence mode="wait">
                    {activeTab === "form" ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <InputGroup label="商品名" icon={<Tag size={16} />}>
                                <input
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="例：牛乳、たまご"
                                    className="w-full bg-transparent border-none outline-none text-foreground font-bold placeholder:text-foreground/20"
                                />
                            </InputGroup>

                            {/* リアルタイム比較表示 */}
                            <AnimatePresence>
                                {currentComparison && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="glass border-indigo-500/30 p-3 rounded-2xl flex items-center justify-between bg-indigo-500/5">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown size={14} className="text-indigo-400" />
                                                <span className="text-[11px] text-indigo-400">過去の底値: <b className="text-foreground">{currentComparison.bestPrice}円</b></span>
                                            </div>
                                            <span className="text-[10px] text-foreground/40">@{currentComparison.store}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="価格" icon={<span className="text-xs font-bold">¥</span>}>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent border-none outline-none text-foreground font-bold placeholder:text-foreground/20"
                                    />
                                </InputGroup>
                                <div className="flex gap-2 h-full items-end pb-2">
                                    <button type="button" onClick={() => handleTaxAction("in")} className="tax-btn">税込</button>
                                    <button type="button" onClick={() => handleTaxAction("out")} className="tax-btn">税抜</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="数量 (パック等)" icon={<Plus size={14} />}>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-foreground font-bold"
                                    />
                                </InputGroup>
                                <InputGroup label="内容量 (g/ml)" icon={<ChevronDown size={14} />}>
                                    <input
                                        type="number"
                                        value={volume}
                                        onChange={(e) => setVolume(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-foreground font-bold"
                                    />
                                </InputGroup>
                            </div>

                            <InputGroup label="店名" icon={<Store size={16} />}>
                                <input
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="例：スーパーA"
                                    className="w-full bg-transparent border-none outline-none text-foreground font-bold placeholder:text-foreground/20"
                                />
                            </InputGroup>

                            {/* 単価表示 */}
                            <div className={cn(
                                "glass glossy-border p-6 rounded-3xl flex flex-col items-center justify-center gap-2 mt-8 transition-all duration-500",
                                unitPrice && currentComparison && parseFloat(unitPrice) <= currentComparison.bestPrice
                                    ? "bg-green-500/10 border-green-500/50"
                                    : "bg-white/5"
                            )}>
                                <span className="text-xs font-medium opacity-50 tracking-widest uppercase">
                                    {unitPrice && currentComparison && parseFloat(unitPrice) <= currentComparison.bestPrice ? "✨底値更新！✨" : "1単位あたりの価格"}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-light text-foreground">{unitPrice || "--"}</span>
                                    <span className="text-lg font-medium opacity-70">円</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !unitPrice}
                                className="w-full py-4 glass glossy-border bg-indigo-500/20 rounded-2xl text-foreground font-bold shadow-xl hover:bg-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-20 mt-4 h-16 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" /> : "この履歴を登録する"}
                            </button>

                            {status && <p className="text-center text-sm text-indigo-300 animate-pulse">{status}</p>}
                        </motion.form>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {Object.keys(topStoresByItem).length === 0 ? (
                                <div className="py-20 text-center opacity-20">履歴がまだありません</div>
                            ) : (
                                Object.entries(topStoresByItem).map(([item, topStores]) => (
                                    <div key={item} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="font-bold text-foreground text-sm">{item}</h3>
                                            <span className="text-[10px] opacity-30 uppercase tracking-tighter">Top 3 Stores</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            {topStores.map((s, idx) => (
                                                <div key={idx} className={cn(
                                                    "glass glossy-border p-3 rounded-2xl flex items-center justify-between",
                                                    idx === 0 ? "bg-indigo-500/10 border-indigo-500/40" : "bg-white/5"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                            idx === 0 ? "bg-yellow-400 text-yellow-900" : "bg-foreground/10 text-foreground/50"
                                                        )}>{idx + 1}</span>
                                                        <span className="text-sm font-medium text-foreground/90">{s.shop_name}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-bold text-indigo-500 dark:text-indigo-300">{s.unit_price}</span>
                                                        <span className="text-[10px] opacity-40">円</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* 全履歴（簡易版） */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-bold text-white/20 mb-4 px-1 tracking-widest uppercase">Recent All Records</p>
                                <div className="space-y-2">
                                    {records.slice(0, 5).map((record) => (
                                        <div key={record.id} className="flex items-center justify-between px-1 py-1 text-xs border-b border-foreground/5 pb-2">
                                            <div className="opacity-60">
                                                {record.item_name} <span className="opacity-40 ml-1">@{record.shop_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold opacity-80">{record.unit_price}円</div>
                                                <button
                                                    onClick={() => deleteRecord(record.id)}
                                                    className="p-1 opacity-10 hover:text-red-500 hover:opacity-100"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
        .tax-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 11px;
          font-weight: bold;
          transition: all 0.2s;
        }
        .tax-btn:active {
          background: rgba(255,255,255,0.15);
          transform: scale(0.95);
        }
      `}</style>
        </motion.div>
    );
}

function InputGroup({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold opacity-40 ml-1 tracking-wider uppercase">{label}</span>
            <div className="glass glossy-border px-4 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
                <div className="opacity-30">{icon}</div>
                {children}
            </div>
        </div>
    );
}
