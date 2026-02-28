"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudRain, CloudLightning, Sun, CloudSnow, CloudDrizzle, Navigation, Gauge, AlertCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WeatherData {
    temp: number;
    condition: string;
    pressure: number;
    humidity: number;
    city: string;
}

export default function WeatherWidget({ city }: { city: string }) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [city]);

    const fetchWeather = async () => {
        if (!city) return;
        try {
            setLoading(true);
            let query = city.trim();

            // 「現在地」または空の場合は位置情報を試みる
            if (query === "現在地" || query === "current" || query === "Auto") {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    query = `${pos.coords.latitude},${pos.coords.longitude}`;
                } catch (e) {
                    console.warn("Geolocation failed, falling back to Tokyo", e);
                    query = "Tokyo";
                }
            }

            const encodedCity = encodeURIComponent(query);
            const res = await fetch(`https://wttr.in/${encodedCity}?format=j1`);
            if (!res.ok) throw new Error("Weather fetch failed");
            const data = await res.json();

            if (!data.current_condition || data.current_condition.length === 0) {
                throw new Error("Location not found");
            }

            const current = data.current_condition[0];
            // 表示用の地名を取得（現在地の場合はより近い場所の名前を表示）
            const cityDisplay = data.nearest_area ? data.nearest_area[0].areaName[0].value : city;

            setWeather({
                temp: parseInt(current.temp_C),
                condition: current.lang_jp ? current.lang_jp[0].value : current.weatherDesc[0].value,
                pressure: parseInt(current.pressure),
                humidity: parseInt(current.humidity),
                city: cityDisplay
            });
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes("晴れ") || c.includes("clear") || c.includes("sun")) return <Sun className="text-yellow-400" size={32} />;
        if (c.includes("雨") || c.includes("rain")) return <CloudRain className="text-blue-400" size={32} />;
        if (c.includes("雷") || c.includes("thunder")) return <CloudLightning className="text-purple-400" size={32} />;
        if (c.includes("雪") || c.includes("snow")) return <CloudSnow className="text-slate-200" size={32} />;
        if (c.includes("曇") || c.includes("cloud") || c.includes("overcast")) return <Cloud className="text-slate-400" size={32} />;
        return <Cloud className="text-slate-400" size={32} />;
    };

    const getPressureStatus = (pressure: number) => {
        // 標準気圧 1013hPa
        if (pressure < 1005) return { label: "低気圧注意", color: "text-rose-500", icon: <AlertCircle size={14} /> };
        if (pressure < 1010) return { label: "やや低い", color: "text-orange-400", icon: <Gauge size={14} /> };
        return { label: "安定", color: "text-emerald-400", icon: <Gauge size={14} /> };
    };

    if (loading && !weather) {
        return (
            <div className="glass glossy-border p-4 rounded-3xl aspect-square flex flex-col justify-center items-center shadow-lg animate-pulse">
                <div className="w-10 h-10 bg-white/10 rounded-full mb-2" />
                <div className="h-4 w-12 bg-white/10 rounded" />
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="glass glossy-border p-4 rounded-3xl aspect-square flex flex-col justify-center items-center shadow-lg opacity-50">
                <AlertCircle size={32} />
                <p className="text-[10px] mt-2">通信エラー</p>
                <button onClick={fetchWeather} className="text-[10px] underline mt-1">再試行</button>
            </div>
        );
    }

    const pressureInfo = getPressureStatus(weather.pressure);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass glossy-border p-4 rounded-3xl aspect-square flex flex-col justify-between shadow-lg relative overflow-hidden group"
        >
            {/* 背景の微かな光（気圧によって色を変える） */}
            <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-1000",
                weather.pressure < 1005 ? "bg-rose-500" : "bg-indigo-500"
            )} />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Weather</span>
                        {lastUpdated && <span className="text-[8px] font-bold opacity-30">{lastUpdated}更新</span>}
                    </div>
                    <span className="text-xs font-bold">{weather.city}</span>
                </div>
                <div onClick={fetchWeather} className="cursor-pointer hover:rotate-180 transition-transform duration-500">
                    {getWeatherIcon(weather.condition)}
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">{weather.temp}</span>
                    <span className="text-lg font-bold opacity-50">°C</span>
                </div>
                <div className="text-[11px] font-bold opacity-70 mt-0.5">{weather.condition}</div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 relative z-10">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold opacity-40">
                        <Gauge size={10} /> 気圧
                    </div>
                    <div className="text-[10px] font-black">{weather.pressure} hPa</div>
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded-full bg-white/5 flex items-center gap-1 text-[8px] font-black",
                    pressureInfo.color
                )}>
                    {pressureInfo.icon}
                    {pressureInfo.label}
                </div>
            </div>
        </motion.div>
    );
}
