"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
            setLoading(false);
        } else {
            // layout side will detect session change or OSContainer will handle it
            window.location.reload();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* 背景の装飾的なボケ */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-pink-500/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm glass glossy-border p-8 rounded-[2rem] shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-inner border-white/30">
                        ✨
                    </div>
                    <h1 className="text-3xl font-bold tracking-widest text-white mb-1">LIFES</h1>
                    <p className="text-white/50 text-xs">Personal Life Management OS</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="email"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                            required
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-300 text-[10px] text-center px-4"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-indigo-900 font-bold py-3 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-black/20"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>ログイン</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/30 text-[10px]">
                        &copy; 2026 Ocean-BF. All rights reserved.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
