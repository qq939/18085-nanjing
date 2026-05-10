#!/usr/bin/env python3
"""一次性创建schedules表的脚本"""
import sys
import os
import signal

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'
)  # line 14: server.js连接池配置使用

def timeout_handler(signum, frame):
    print("操作超时")
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(60)

try:
    import psycopg2
except ImportError:
    print("缺少psycopg2模块，正在安装...")
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary'])
    import psycopg2

def create_schedules_table():
    """创建schedules表"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
            description TEXT,
            start_time TIMESTAMPTZ NOT NULL,
            end_time TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT valid_time_range CHECK (end_time > start_time)
        )
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules(start_time)
    """)
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_schedules_time_range ON schedules(start_time, end_time)
    """)

    cur.execute("ALTER TABLE schedules ENABLE ROW LEVEL SECURITY")

    cur.execute("""
        DROP POLICY IF EXISTS "Allow all access" ON schedules
    """)
    cur.execute("""
        CREATE POLICY "Allow all access" ON schedules
        FOR ALL USING (true) WITH CHECK (true)
    """)

    cur.execute("GRANT ALL ON schedules TO anon")
    cur.execute("GRANT ALL ON schedules TO authenticated")
    cur.execute("GRANT ALL ON schedules TO postgres")

    conn.commit()
    cur.close()
    conn.close()

    print("✓ schedules表创建成功")
    return True

if __name__ == '__main__':
    try:
        create_schedules_table()
        signal.alarm(0)
        sys.exit(0)
    except Exception as e:
        print(f"创建失败: {e}")
        signal.alarm(0)
        sys.exit(1)
