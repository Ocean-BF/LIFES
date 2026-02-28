"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        // 日本語形式で出力
        return date.toLocaleDateString('ja-JP', options);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-4 text-white text-center"
        >
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">
                {formatDate(time)}
            </div>
            <div className="text-6xl font-black tracking-tighter drop-shadow-xl">
                {formatTime(time)}
            </div>
        </motion.div>
    );
}
