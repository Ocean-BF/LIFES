"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Scale, BadgePercent, ArrowRightLeft, Info, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Product {
    name: string;
    price: string;
    volume: string;
    quantity: string;
}

export default function PriceComparator({ onClose }: { onClose: () => void }) {
    const [productA, setProductA] = useState<Product>({ name: "商品A", price: "", volume: "", quantity: "1" });
    const [productB, setProductB] = useState<Product>({ name: "商品B", price: "", volume: "", quantity: "1" });

    const calculateUnitPrice = (p: Product) => {
        const price = parseFloat(p.price);
        const volume = parseFloat(p.volume);
        const quantity = parseFloat(p.quantity) || 1;
        if (!price || !volume) return null;
        return price / (volume * quantity);
    };

    const unitPriceA = calculateUnitPrice(productA);
    const unitPriceB = calculateUnitPrice(productB);

    const getResult = () => {
        if (unitPriceA === null || unitPriceB === null) return null;
        if (unitPriceA === unitPriceB) return { winner: "draw", diff: 0, percent: 0 };

        const isAWinner = unitPriceA < unitPriceB;
        const winnerPrice = isAWinner ? unitPriceA : unitPriceB;
        const loserPrice = isAWinner ? unitPriceB : unitPriceA;
        const diff = loserPrice - winnerPrice;
        const percent = ((loserPrice - winnerPrice) / loserPrice) * 100;

        return {
            winner: isAWinner ? "A" : "B",
            diff,
            percent: Math.round(percent * 10) / 10
        };
    };

    const result = getResult();

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-3xl flex flex-col text-foreground overflow-hidden"
        >
            {/* ヘッダー */}
            <header className="p-4 flex items-center justify-between z-10 shrink-0">
                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-black tracking-tighter flex items-center gap-2 justify-center">
                        <Scale className="text-indigo-500" size={20} /> 価格比較
                    </h2>
                </div>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col gap-4 max-h-full overflow-hidden">
                {/* スリムな結果表示 (ここだけは少し左右に余白を持たせる) */}
                <div className="h-20 shrink-0 px-4">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "h-full rounded-3xl flex flex-col items-center justify-center p-2 shadow-xl relative overflow-hidden transition-all duration-500",
                                    result.winner === "draw"
                                        ? "glass border-white/10"
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                )}
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Result</p>
                                {result.winner === "draw" ? (
                                    <h3 className="text-lg font-black">どちらも同じ価格です</h3>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black">
                                            {result.winner === "A" ? productA.name : productB.name} がおトク！
                                        </h3>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                                            約{result.percent}% 安い
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-foreground/10 rounded-3xl flex items-center justify-center gap-3 opacity-30">
                                <BadgePercent size={24} />
                                <p className="text-sm font-bold italic tracking-tight">数値を入力して比較</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 入力エリア：左右余白なしのフルスクリーンレイアウト */}
                <div className="flex-1 grid grid-cols-2 min-h-0 bg-foreground/5 border-t border-white/5">
                    {/* 商品A */}
                    <ProductCard
                        label="商品A"
                        color="indigo"
                        product={productA}
                        unitPrice={unitPriceA}
                        isWinner={result?.winner === "A"}
                        onChange={(field, val) => setProductA({ ...productA, [field]: val })}
                    />

                    {/* 商品B */}
                    <ProductCard
                        label="商品B"
                        color="rose"
                        product={productB}
                        unitPrice={unitPriceB}
                        isWinner={result?.winner === "B"}
                        onChange={(field, val) => setProductB({ ...productB, [field]: val })}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function ProductCard({
    label,
    color,
    product,
    unitPrice,
    isWinner,
    onChange
}: {
    label: string,
    color: "indigo" | "rose",
    product: Product,
    unitPrice: number | null,
    isWinner: boolean,
    onChange: (field: string, val: string) => void
}) {
    const isIndigo = color === "indigo";
    const themeColor = isIndigo ? "text-indigo-400" : "text-rose-400";

    // 背景グラデーションの設定 - より奥深く鮮やかに
    const baseGradient = isIndigo
        ? "from-indigo-600/10 via-indigo-950/20 to-transparent"
        : "from-rose-600/10 via-rose-950/20 to-transparent";

    const winnerGradient = isIndigo
        ? "from-indigo-500/30 via-indigo-600/10 to-transparent"
        : "from-rose-500/30 via-rose-600/10 to-transparent";

    return (
        <div className={cn(
            "p-6 flex flex-col gap-6 transition-all duration-700 relative h-full border-r last:border-r-0 border-white/5",
            "bg-gradient-to-b",
            isWinner ? winnerGradient : baseGradient,
            !isWinner && "opacity-40"
        )}>
            {/* 上部と側面の光の装飾 */}
            <div className={cn(
                "absolute inset-x-0 top-0 h-[3px] opacity-60",
                isIndigo ? "bg-gradient-to-r from-transparent via-indigo-400 to-transparent" : "bg-gradient-to-r from-transparent via-rose-400 to-transparent"
            )} />

            {isWinner && (
                <div className={cn(
                    "absolute inset-0 opacity-10 blur-3xl",
                    isIndigo ? "bg-indigo-500" : "bg-rose-500"
                )} />
            )}

            <div className="flex items-center justify-between shrink-0 relative z-10">
                <input
                    value={product.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    className={cn(
                        "bg-transparent border-none outline-none font-black text-2xl w-full text-center transition-all",
                        isWinner ? "text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110" : themeColor
                    )}
                />
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
                <InputItem label="価格" value={product.price} onChange={(v) => onChange("price", v)} placeholder="0" suffix="円" color={color} isWinner={isWinner} />
                <InputItem label="容量" value={product.volume} onChange={(v) => onChange("volume", v)} placeholder="0" suffix="" color={color} isWinner={isWinner} />
                <InputItem label="個数" value={product.quantity} onChange={(v) => onChange("quantity", v)} placeholder="1" suffix="" color={color} isWinner={isWinner} />
            </div>

            <div className={cn(
                "mt-auto p-5 rounded-[2.5rem] text-center shrink-0 transition-all duration-700 border overflow-hidden relative group",
                isWinner
                    ? (isIndigo ? "bg-indigo-500/30 border-indigo-400/50 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-105" : "bg-rose-500/30 border-rose-400/50 shadow-[0_0_30px_rgba(244,63,94,0.3)] scale-105")
                    : "bg-white/5 border-white/5"
            )}>
                {/* 内部のフレア効果 */}
                <div className={cn(
                    "absolute inset-0 opacity-30 bg-gradient-to-br transition-opacity transition-all duration-700",
                    isIndigo ? "from-indigo-400 via-transparent to-transparent" : "from-rose-400 via-transparent to-transparent",
                    isWinner ? "opacity-100" : "opacity-0"
                )} />

                <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest relative z-10">Unit Price</p>
                <div className={cn(
                    "text-3xl font-black tracking-tighter relative z-10 transition-all",
                    isWinner ? "text-white" : "opacity-80 " + themeColor
                )}>
                    {unitPrice !== null ? `¥${unitPrice.toFixed(2)}` : "---"}
                </div>
                <p className="text-[9px] opacity-40 relative z-10">/ 単位量あたり</p>
            </div>
        </div>
    );
}

function InputItem({
    label,
    value,
    onChange,
    placeholder,
    suffix,
    color,
    isWinner
}: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    suffix: string,
    color: "indigo" | "rose",
    isWinner: boolean
}) {
    const isIndigo = color === "indigo";
    return (
        <div className="space-y-2">
            <label className={cn(
                "text-[10px] font-black uppercase block text-center tracking-[0.2em] transition-opacity",
                isWinner ? "opacity-40" : "opacity-20"
            )}>{label}</label>
            <div className="relative group">
                <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "bg-white/5 border border-white/5 outline-none w-full text-2xl font-black text-center py-4 rounded-3xl transition-all",
                        "focus:bg-white/10 focus:border-white/20",
                        isIndigo
                            ? "focus:text-indigo-300 focus:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                            : "focus:text-rose-300 focus:shadow-[0_0_30px_rgba(244,63,94,0.1)]",
                        isWinner && "bg-white/10"
                    )}
                />
                <span className="absolute right-4 bottom-4 text-[10px] font-black opacity-30 pointer-events-none tracking-tighter">{suffix}</span>
            </div>
        </div>
    );
}
