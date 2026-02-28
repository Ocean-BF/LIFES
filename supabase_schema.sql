-- アプリ管理テーブル
CREATE TABLE IF NOT EXISTS public.apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    icon_type TEXT DEFAULT 'emoji' NOT NULL, -- 'emoji', 'lucide', 'image'
    icon_value TEXT NOT NULL,
    category TEXT DEFAULT 'life' NOT NULL, -- 'home', 'life', 'health', 'learning', 'play', 'settings'
    path TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL
);

-- プロフィールテーブルの拡張
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '👤';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallpaper_id TEXT DEFAULT 'glass';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weather_city TEXT DEFAULT 'Tokyo';

-- 既存の全プロフィールに一度適用（必要に応じて）
UPDATE public.profiles SET 
  is_admin = TRUE,
  avatar_emoji = '👤',
  wallpaper_id = 'glass'
WHERE id = auth.uid();

-- お気に入り（ホーム画面表示）テーブル
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, app_id)
);

-- RLS (Row Level Security) の設定
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- appsテーブルの書き込み権限を管理者のみに制限するポリシー
DROP POLICY IF EXISTS "Enable all access for all users" ON public.apps;
CREATE POLICY "Apps are viewable by everyone" 
ON public.apps FOR SELECT USING (true);

CREATE POLICY "Apps are manageable by admins only" 
ON public.apps FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- favorites: 自分のデータのみ操作可能
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 初期データのサンプル挿入
INSERT INTO public.apps (title, icon_type, icon_value, category, path, sort_order) VALUES
('買い物メモ', 'emoji', '🛒', 'life', '/life/shopping', 1),
('価格比較', 'emoji', '⚖️', 'life', '/life/comparison', 2),
('歩数計', 'emoji', '🚶', 'health', '/health/steps', 1),
('読書ログ', 'emoji', '📚', 'learning', '/learning/books', 1),
('映画メモ', 'emoji', '🎬', 'play', '/play/movies', 1);

-- 共有カレンダー用テーブル
CREATE TABLE IF NOT EXISTS public.shared_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_avatar TEXT,
    event_date DATE NOT NULL,
    event_time TEXT, -- 'HH:mm' 形式
    title TEXT NOT NULL,
    color TEXT DEFAULT 'indigo' -- イベントの色分け用
);

-- RLS設定
ALTER TABLE public.shared_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Shared events are viewable by everyone" ON public.shared_events;
CREATE POLICY "Shared events are viewable by everyone" ON public.shared_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Shared events are manageable by authenticated users" ON public.shared_events;
CREATE POLICY "Shared events are manageable by authenticated users" ON public.shared_events FOR ALL USING (auth.role() = 'authenticated');

-- 初期データのサンプル（カレンダーアプリを生活カテゴリに追加）
INSERT INTO public.apps (title, icon_type, icon_value, category, path, sort_order) VALUES
('カレンダー', 'emoji', '📅', 'life', '/life/calendar', 0);
