"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import OSContainer from "@/components/OSContainer";
import LoginPage from "@/components/Login";
import { Loader2 } from "lucide-react";

export default function AppRoot() {
    const [session, setSession] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        // 初回セッションチェック
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitializing(false);
        });

        // 認証状態の変更を監視
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0b]">
                <Loader2 className="animate-spin text-white/20" size={48} />
            </div>
        );
    }

    // ログインしていればOS画面、していなければログイン画面
    return session ? <OSContainer /> : <LoginPage />;
}
