"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Save, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface CalendarEvent {
    id: string;
    event_date: string;
    event_time: string;
    title: string;
    color: string;
    user_avatar: string;
    user_id: string;
}

export default function SharedCalendar({ onClose }: { onClose: () => void }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        fetchEvents();
    }, [year, month]);

    const fetchEvents = async () => {
        setLoading(true);
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data } = await supabase
            .from("shared_events")
            .select("*")
            .gte("event_date", startDate)
            .lte("event_date", endDate)
            .order("event_date", { ascending: true })
            .order("event_time", { ascending: true }); // 時間でソート

        if (data) setEvents(data);
        setLoading(false);
    };

    const handleSaveEvent = async () => {
        if (!editingEvent?.title || !editingEvent?.event_date) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // ユーザーの現在のアバターを取得
        const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_emoji")
            .eq("id", user.id)
            .single();

        const eventData = {
            title: editingEvent.title,
            event_date: editingEvent.event_date,
            event_time: editingEvent.event_time, // 追加
            user_id: user.id,
            user_avatar: profile?.avatar_emoji || "👤"
        };

        if (editingEvent.id) {
            await supabase.from("shared_events").update(eventData).eq("id", editingEvent.id);
        } else {
            await supabase.from("shared_events").insert(eventData);
        }

        setIsAddModalOpen(false);
        setEditingEvent(null);
        fetchEvents();
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("予定を削除しますか？")) return;
        await supabase.from("shared_events").delete().eq("id", id);
        fetchEvents();
    };

    // 日本の祝日判定 (簡易版)
    const getHolidayName = (y: number, m: number, d: number) => {
        const dateStr = `${m + 1}/${d}`;
        const dayOfWeek = new Date(y, m, d).getDay();
        const nthMonday = Math.ceil(d / 7);

        // 固定祝日
        if (dateStr === "1/1") return "元旦";
        if (dateStr === "2/11") return "建国記念の日";
        if (dateStr === "2/23") return "天皇誕生日";
        if (dateStr === "4/29") return "昭和の日";
        if (dateStr === "5/3") return "憲法記念日";
        if (dateStr === "5/4") return "みどりの日";
        if (dateStr === "5/5") return "こどもの日";
        if (dateStr === "8/11") return "山の日";
        if (dateStr === "11/3") return "文化の日";
        if (dateStr === "11/23") return "勤労感謝の日";

        // 月曜祝日 (Happy Monday)
        if (m === 0 && nthMonday === 2 && dayOfWeek === 1) return "成人の日";
        if (m === 6 && nthMonday === 3 && dayOfWeek === 1) return "海の日";
        if (m === 8 && nthMonday === 3 && dayOfWeek === 1) return "敬老の日";
        if (m === 9 && nthMonday === 2 && dayOfWeek === 1) return "スポーツの日";

        // 春分・秋分 (簡易計算)
        if (m === 2 && d === Math.floor(20.8431 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4))) return "春分の日";
        if (m === 8 && d === Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4))) return "秋分の日";

        return null;
    };

    // 振替休日判定
    const isHoliday = (y: number, m: number, d: number) => {
        const name = getHolidayName(y, m, d);
        if (name) return name;

        // 振替休日判定
        const dayOfWeek = new Date(y, m, d).getDay();
        if (dayOfWeek === 1) { // 月曜の場合、日曜が祝日かチェック
            const sunName = getHolidayName(y, m, d - 1);
            if (sunName) return "振替休日";
        }
        return null;
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        const holiday = isHoliday(year, month, d);
        const dayEvents = events.filter(e => {
            const ed = new Date(e.event_date);
            return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === d;
        });

        return { day: d, dayOfWeek, holiday, events: dayEvents };
    });

    const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white flex flex-col text-slate-900 overflow-hidden"
        >
            {/* ヘッダー */}
            <header className="p-4 flex items-center justify-between z-10 shrink-0">
                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 opacity-50"><ChevronLeft size={20} /></button>
                    <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <CalendarIcon className="text-indigo-500" size={20} /> {year}年 {month + 1}月
                    </h2>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 opacity-50"><ChevronRight size={20} /></button>
                </div>
                <button
                    onClick={() => {
                        setEditingEvent({ event_date: `${year}-${String(month + 1).padStart(2, '0')}-01`, event_time: "", title: "" });
                        setIsAddModalOpen(true);
                    }}
                    className="p-2 bg-indigo-500 text-white rounded-full shadow-lg"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* リストエリア */}
            <div className="flex-1 overflow-y-auto px-4 pb-12 ios-scroll">
                <div className="max-w-md mx-auto space-y-1">
                    {days.map(({ day, dayOfWeek, holiday, events }) => {
                        const isSunday = dayOfWeek === 0;
                        const isSaturday = dayOfWeek === 6;
                        const dateColor = (isSunday || holiday) ? "text-rose-500" : isSaturday ? "text-blue-500" : "text-slate-600";
                        const bgColor = (isSunday || holiday) ? "bg-rose-500/5" : isSaturday ? "bg-blue-500/5" : "bg-slate-50";

                        return (
                            <div key={day} className={cn("flex flex-col rounded-2xl p-3 px-4 border border-white/5", bgColor)}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className={cn("text-xl font-black", dateColor)}>{day}</span>
                                        <span className={cn("text-xs font-bold opacity-60", dateColor)}>{dayLabels[dayOfWeek]}</span>
                                        {holiday && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black ml-1">{holiday}</span>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const formattedDay = String(day).padStart(2, '0');
                                            const formattedMonth = String(month + 1).padStart(2, '0');
                                            setEditingEvent({ event_date: `${year}-${formattedMonth}-${formattedDay}`, event_time: "", title: "" });
                                            setIsAddModalOpen(true);
                                        }}
                                        className="p-1 opacity-20 hover:opacity-100 transition-opacity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {events.map(event => (
                                        <motion.div
                                            key={event.id}
                                            layoutId={event.id}
                                            onClick={() => {
                                                setEditingEvent(event);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="bg-indigo-500/10 border-l-4 border-indigo-500 p-2 py-1.5 rounded-xl text-sm font-bold flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 flex-1 truncate">
                                                <span className="text-base shrink-0">{event.user_avatar || "👤"}</span>
                                                {event.event_time && <span className="text-[10px] font-black opacity-40 tabular-nums">{event.event_time}</span>}
                                                <span className="truncate">{event.title}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                                className="opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {events.length === 0 && (
                                        <div className="h-4" /> // 予定がない日のための最低限の余白
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 追加・編集モーダル */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative text-slate-900"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
                            <div className="flex justify-between items-center mb-6 pt-2">
                                <h3 className="text-xl font-black">{editingEvent?.id ? "予定の編集" : "新しい予定"}</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 opacity-30 hover:opacity-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">日付</label>
                                    <input
                                        type="date"
                                        value={editingEvent?.event_date || ""}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                                        className="w-full bg-slate-100 border-none outline-none p-4 rounded-2xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">時間</label>
                                    <input
                                        type="time"
                                        value={editingEvent?.event_time || ""}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
                                        className="w-full bg-slate-100 border-none outline-none p-4 rounded-2xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">予定タイトル</label>
                                    <input
                                        type="text"
                                        value={editingEvent?.title || ""}
                                        autoFocus
                                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        placeholder="例：家族でお出かけ"
                                        className="w-full bg-slate-100 border-none outline-none p-4 rounded-2xl font-bold"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingEvent?.id && (
                                        <button
                                            onClick={() => handleDeleteEvent(editingEvent.id!)}
                                            className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveEvent}
                                        className="flex-1 py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} /> 保存する
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/40 z-[-1] backdrop-blur-sm" />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
