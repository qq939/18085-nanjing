-- 修复 Supabase schedules 表的 RLS 策略
-- 运行此脚本后，RLS 会允许公开读写 schedules 表

-- 1. 启用 RLS（如果还没启用）
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略（谨慎操作）
DROP POLICY IF EXISTS "允许公开读取" ON schedules;
DROP POLICY IF EXISTS "允许公开插入" ON schedules;
DROP POLICY IF EXISTS "允许公开更新" ON schedules;
DROP POLICY IF EXISTS "允许公开删除" ON schedules;
DROP POLICY IF EXISTS "Allow public read access" ON schedules;
DROP POLICY IF EXISTS "Allow public insert access" ON schedules;
DROP POLICY IF EXISTS "Allow public update access" ON schedules;
DROP POLICY IF EXISTS "Allow public delete access" ON schedules;

-- 3. 创建允许公开访问的策略
CREATE POLICY "Allow public read access" ON schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON schedules FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON schedules FOR DELETE USING (true);

-- 4. 验证策略创建成功
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'schedules';