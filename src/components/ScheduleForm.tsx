import { useState } from 'react'
import type { Schedule } from '../types'

interface Props {
  schedule?: Schedule | null
  onSubmit: (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(schedule?.title || '')
  const [description, setDescription] = useState(schedule?.description || '')
  const [startTime, setStartTime] = useState(schedule?.start_time ? new Date(schedule.start_time).toISOString().slice(0, 16) : '')
  const [endTime, setEndTime] = useState(schedule?.end_time ? new Date(schedule.end_time).toISOString().slice(0, 16) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description: description || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="schedule-form">
      <h2>{schedule ? '编辑日程' : '添加日程'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">事项名称 *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入事项名称"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">描述（可选）</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加描述..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="startTime">开始时间 *</label>
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endTime">结束时间 *</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {schedule ? '保存修改' : '添加日程'}
      </button>
      
      {schedule && (
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          取消编辑
        </button>
      )}
    </form>
  )
}
