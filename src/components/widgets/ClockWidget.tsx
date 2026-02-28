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
        const s = date.getSeconds().toString().padStart(2, '0');
        return (
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter drop-shadow-xl">{h}:{m}</span>
                <span className="text-2xl font-black opacity-30 tabular-nums">{s}</span>
            </div>
        );
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        };
        return date.toLocaleDateString('ja-JP', options);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-6 text-white text-center"
        >
            <div className="text-[14px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">
                {formatDate(time)}
            </div>
            {formatTime(time)}
        </motion.div>
    );
}
