"use client";

import React from "react";
import WeatherWidget from "./WeatherWidget";
import { Calendar, Clock, Smile } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeWidgets({ city }: { city: string }) {
    const today = new Date();
    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <div className="grid grid-cols-2 gap-4">
            <WeatherWidget city={city} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass glossy-border p-4 rounded-3xl aspect-square flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Calendar</span>
                    <Calendar className="text-indigo-400 opacity-60" size={20} />
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-[10px] font-black text-rose-500 mb-1">{dayLabels[today.getDay()]}</span>
                    <span className="text-5xl font-black tracking-tighter leading-none">{today.getDate()}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Smile size={12} className="text-amber-400" />
                        <span className="text-[10px] font-bold opacity-60">Have a nice day!</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
