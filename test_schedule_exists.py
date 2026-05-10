#!/usr/bin/env python3
"""测试脚本：验证schedules表及相关函数是否存在"""
import sys
import os
import signal

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'
)  # line 14: server.js连接池配置使用

def timeout_handler(signum, frame):
    print("测试超时")
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(30)

try:
    import psycopg2
except ImportError:
    print("缺少psycopg2模块，正在安装...")
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary'])
    import psycopg2

def test_schedule_table_exists():
    """测试schedules表是否存在"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'schedules'
        )
    """)
    exists = cur.fetchone()[0]
    cur.close()
    conn.close()
    assert exists, "schedules表不存在"
    print("✓ schedules表已存在")
    return True

def test_functions_exist():
    """测试函数是否存在"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.routines
            WHERE routine_schema = 'public'
            AND routine_name = 'get_schedules_in_range'
        )
    """)
    func1_exists = cur.fetchone()[0]
    assert func1_exists, "get_schedules_in_range函数不存在"
    print("✓ get_schedules_in_range函数已存在")

    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.routines
            WHERE routine_schema = 'public'
            AND routine_name = 'check_time_conflict'
        )
    """)
    func2_exists = cur.fetchone()[0]
    assert func2_exists, "check_time_conflict函数不存在"
    print("✓ check_time_conflict函数已存在")

    cur.close()
    conn.close()
    return True

if __name__ == '__main__':
    try:
        test_schedule_table_exists()
        test_functions_exist()
        print("测试通过: 所有表和函数已正确创建")
        signal.alarm(0)
        sys.exit(0)
    except Exception as e:
        print(f"测试失败: {e}")
        signal.alarm(0)
        sys.exit(1)
