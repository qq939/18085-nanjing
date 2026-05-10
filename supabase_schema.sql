-- Supabase Schema for 日程管理应用

-- 创建日程表
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- 确保结束时间晚于开始时间
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_schedules_time_range ON schedules(start_time, end_time);

-- 启用 Row Level Security (RLS)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 创建查询时间段内所有日程的函数（用于冲突检测）
CREATE OR REPLACE FUNCTION get_schedules_in_range(start_query TIMESTAMPTZ, end_query TIMESTAMPTZ)
RETURNS TABLE(id UUID, title TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.title, s.start_time, s.end_time
    FROM schedules s
    WHERE
        -- 时间段有交集: (start1 < end2) AND (end1 > start2)
        s.start_time < end_query AND s.end_time > start_query
    ORDER BY s.start_time;
END;
$$ LANGUAGE plpgsql;

-- 创建检查冲突的函数
CREATE OR REPLACE FUNCTION check_time_conflict(
    start_query TIMESTAMPTZ,
    end_query TIMESTAMPTZ,
    exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(id UUID, title TEXT, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.title, s.start_time, s.end_time
    FROM schedules s
    WHERE
        s.start_time < end_query AND s.end_time > start_query
        AND (exclude_id IS NULL OR s.id != exclude_id);
END;
$$ LANGUAGE plpgsql;

-- 公开访问策略（用于开发测试）
DROP POLICY IF EXISTS "Allow all access" ON schedules;
CREATE POLICY "Allow all access" ON schedules
    FOR ALL USING (true) WITH CHECK (true);

-- 授予权限
GRANT ALL ON schedules TO anon;
GRANT ALL ON schedules TO authenticated;
GRANT ALL ON schedules TO postgres;