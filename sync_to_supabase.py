import pandas as pd
import psycopg2
from psycopg2 import extras
import time
import os
import sys

# Supabase PostgreSQL 连接配置
DB_CONFIG = {
    "host": "aws-1-ap-northeast-2.pooler.supabase.com",
    "port": "5432",
    "database": "postgres",
    "user": "postgres.uacwkmdyekxyqtopdele",
    "password": "Black_supabase00"
}

CSV_PATH = os.path.join(os.path.dirname(__file__), 'schedules.csv')
TABLE_NAME = "schedules"

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def init_pull():
    """初始化：从 Supabase 拉取数据到本地 CSV"""
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 初始化同步：从 Supabase 拉取数据...")
    try:
        conn = get_conn()
        df = pd.read_sql(f"SELECT * FROM {TABLE_NAME}", conn)
        conn.close()
        df.to_csv(CSV_PATH, index=False)
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 拉取成功，共 {len(df)} 条记录")
        return True
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 拉取失败: {e}")
        if not os.path.exists(CSV_PATH):
            with open(CSV_PATH, 'w') as f:
                f.write("id,title,description,start_time,end_time,created_at,updated_at\n")
        return False

def sync_push():
    """定时任务：将本地 CSV 覆盖同步到 Supabase"""
    if not os.path.exists(CSV_PATH):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] schedules.csv 不存在，跳过")
        return

    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 同步 CSV 到 Supabase...")
    try:
        df = pd.read_csv(CSV_PATH)
        if df.empty:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] CSV 为空，跳过")
            return

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"TRUNCATE TABLE {TABLE_NAME} CASCADE")
        
        cols = ",".join(df.columns)
        query = f"INSERT INTO {TABLE_NAME} ({cols}) VALUES %s"
        extras.execute_values(cur, query, df.values.tolist())
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 同步成功: {len(df)} 条")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 同步失败: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--pull":
        init_pull()
    else:
        while True:
            sync_push()
            time.sleep(60)