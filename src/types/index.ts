export interface Schedule {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export type ConnectorSide = 'left' | 'right'

export interface Arrow {
  id: string
  source_schedule_id: string
  source_side: ConnectorSide
  target_schedule_id: string
  target_side: ConnectorSide
  created_at: string
  updated_at: string
}
