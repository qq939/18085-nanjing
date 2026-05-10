import { useState, useEffect, useRef } from 'react'
import type { Schedule } from '../types'

interface Props {
  schedule?: Schedule | null
  onSubmit: (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const isInitializedRef = useRef(false)

  // 当 schedule 变化时更新表单
  useEffect(() => {
    console.log('[ScheduleForm] 检测到 schedule 变化:', JSON.stringify(schedule))
    
    if (schedule && typeof schedule === 'object') {
      // 编辑模式：用实际数据填充
      const newTitle = schedule.title || ''
      const newDesc = schedule.description || ''
      
      // 处理时间格式 - 确保是有效日期
      let newStartTime = ''
      let newEndTime = ''
      
      if (schedule.start_time) {
        const startDate = new Date(schedule.start_time)
        console.log('[ScheduleForm] start_time 原始值:', schedule.start_time, '-> 转换后:', startDate.toISOString())
        if (!isNaN(startDate.getTime())) {
          newStartTime = formatDateTimeLocal(startDate)
        }
      }
      
      if (schedule.end_time) {
        const endDate = new Date(schedule.end_time)
        console.log('[ScheduleForm] end_time 原始值:', schedule.end_time, '-> 转换后:', endDate.toISOString())
        if (!isNaN(endDate.getTime())) {
          newEndTime = formatDateTimeLocal(endDate)
        }
      }
      
      console.log('[ScheduleForm] 设置表单值 - title:', newTitle, 'desc:', newDesc, 'start:', newStartTime, 'end:', newEndTime)
      
      setTitle(newTitle)
      setDescription(newDesc)
      setStartTime(newStartTime)
      setEndTime(newEndTime)
      
      isInitializedRef.current = true
    } else {
      // 添加模式：重置为默认值
      console.log('[ScheduleForm] 重置表单为添加模式')
      setTitle('')
      setDescription('')
      
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      
      setStartTime(formatDateTimeLocal(now))
      setEndTime(formatDateTimeLocal(oneHourLater))
      
      isInitializedRef.current = false
    }
  }, [schedule?.id]) // 只依赖 id 变化，避免不必要的重渲染

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[ScheduleForm] 提交表单 - title:', title, 'start:', startTime, 'end:', endTime)
    
    if (!title.trim()) {
      alert('请输入事项名称')
      return
    }
    if (!startTime || !endTime) {
      alert('请选择时间')
      return
    }
    
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('时间格式无效')
      return
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="schedule-form">
      <h2>{schedule ? '📝 编辑日程' : '✨ 添加日程'}</h2>
      
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
        {schedule ? '💾 保存修改' : '➕ 添加日程'}
      </button>
      
      {schedule && (
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ❌ 取消编辑
        </button>
      )}
    </form>
  )
}

// 辅助函数：将 Date 转换为 datetime-local 格式 (YYYY-MM-DDTHH:MM)
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}