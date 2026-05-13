import os
import csv
import sys
import time

import psycopg2
from psycopg2 import extras, sql

# DB_CONFIG is used by get_conn() to connect to Supabase PostgreSQL.
DB_CONFIG = {
    "host": "aws-1-ap-northeast-2.pooler.supabase.com",
    "port": "5432",
    "database": "postgres",
    "user": "postgres.uacwkmdyekxyqtopdele",
    "password": "Black_supabase00",
}

# PROJECT_DIR is used by DATASETS to resolve local CSV files in the project root.
PROJECT_DIR = os.path.dirname(__file__)

# DATASETS is used by init_pull(), sync_push_dataset(), and ensure_csv().
DATASETS = {
    "schedules": {
        "table": "schedules",
        "csv_path": os.path.join(PROJECT_DIR, "schedules.csv"),
        "headers": ["id", "title", "description", "start_time", "end_time", "created_at", "updated_at"],
    },
    "arrows": {
        "table": "arrows",
        "csv_path": os.path.join(PROJECT_DIR, "arrows.csv"),
        "headers": [
            "id",
            "source_schedule_id",
            "source_side",
            "target_schedule_id",
            "target_side",
            "created_at",
            "updated_at",
        ],
    },
}


def timestamp():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def get_conn():
    return psycopg2.connect(**DB_CONFIG)


def ensure_remote_schema(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS arrows (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                source_schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
                source_side TEXT NOT NULL CHECK (source_side IN ('left', 'right')),
                target_schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
                target_side TEXT NOT NULL CHECK (target_side IN ('left', 'right')),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )
        cur.execute("CREATE INDEX IF NOT EXISTS idx_arrows_source_schedule_id ON arrows(source_schedule_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_arrows_target_schedule_id ON arrows(target_schedule_id)")
        cur.execute("ALTER TABLE arrows ENABLE ROW LEVEL SECURITY")
        cur.execute('DROP POLICY IF EXISTS "Allow all access" ON arrows')
        cur.execute('CREATE POLICY "Allow all access" ON arrows FOR ALL USING (true) WITH CHECK (true)')
        cur.execute("GRANT ALL ON arrows TO anon")
        cur.execute("GRANT ALL ON arrows TO authenticated")
        cur.execute("GRANT ALL ON arrows TO postgres")
    conn.commit()


def ensure_csv(dataset):
    if not os.path.exists(dataset["csv_path"]):
        with open(dataset["csv_path"], "w", encoding="utf-8") as handle:
            handle.write(",".join(dataset["headers"]) + "\n")


def init_pull():
    """Pull Supabase tables into local CSV files before the app starts."""
    print(f"[{timestamp()}] 初始化同步：从 Supabase 拉取 schedules/arrows...")
    ok = True

    try:
        conn = get_conn()
        ensure_remote_schema(conn)
        for name, dataset in DATASETS.items():
            try:
                query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(dataset["table"]))
                with conn.cursor() as cur:
                    cur.execute(query)
                    rows = cur.fetchall()
                    columns = [desc.name for desc in cur.description]
                records = [
                    {column: row[index] for index, column in enumerate(columns)}
                    for row in rows
                ]
                write_csv(dataset, records)
                print(f"[{timestamp()}] 拉取 {name} 成功，共 {len(records)} 条记录")
            except Exception as error:
                ok = False
                ensure_csv(dataset)
                print(f"[{timestamp()}] 拉取 {name} 失败: {error}")
        conn.close()
    except Exception as error:
        ok = False
        for dataset in DATASETS.values():
            ensure_csv(dataset)
        print(f"[{timestamp()}] 数据库连接失败: {error}")

    return ok


def sync_push_dataset(conn, name, dataset):
    """Overwrite one Supabase table from its matching local CSV file."""
    ensure_csv(dataset)
    print(f"[{timestamp()}] 同步 {name}.csv 到 Supabase {dataset['table']}...")

    with open(dataset["csv_path"], "r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        records = list(reader)

    missing = [header for header in dataset["headers"] if header not in fieldnames]
    if missing:
        raise ValueError(f"{name}.csv 缺少字段: {', '.join(missing)}")

    rows = [[record.get(header, "") for header in dataset["headers"]] for record in records]

    with conn.cursor() as cur:
        cur.execute(
            sql.SQL("TRUNCATE TABLE {} CASCADE").format(sql.Identifier(dataset["table"]))
        )
        if rows:
            columns = sql.SQL(",").join(sql.Identifier(header) for header in dataset["headers"])
            query = sql.SQL("INSERT INTO {} ({}) VALUES %s").format(
                sql.Identifier(dataset["table"]),
                columns,
            )
            extras.execute_values(cur, query.as_string(conn), rows)

    print(f"[{timestamp()}] 同步 {name} 成功: {len(rows)} 条")


def write_csv(dataset, records):
    with open(dataset["csv_path"], "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=dataset["headers"], lineterminator="\n")
        writer.writeheader()
        for record in records:
            writer.writerow({header: record.get(header, "") for header in dataset["headers"]})


def sync_push():
    """Push all local CSV files to Supabase once."""
    try:
        conn = get_conn()
        ensure_remote_schema(conn)
        for name, dataset in DATASETS.items():
            sync_push_dataset(conn, name, dataset)
        conn.commit()
        conn.close()
    except Exception as error:
        print(f"[{timestamp()}] 同步失败: {error}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--pull":
        init_pull()
    elif len(sys.argv) > 1 and sys.argv[1] == "--once":
        sync_push()
    else:
        while True:
            sync_push()
            time.sleep(60)
