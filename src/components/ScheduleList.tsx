import type { Schedule } from '../types'

interface Props {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  onDelete: (id: string) => void
}

function formatDateTime(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

export function ScheduleList({ schedules, onEdit, onDelete }: Props) {
  if (schedules.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📭</div>
        <p>暂无日程，添加一个吧</p>
      </div>
    )
  }

  return (
    <div className="schedule-list">
      {schedules.map((schedule) => {
        const start = new Date(schedule.start_time)
        const end = new Date(schedule.end_time)
        
        return (
          <div key={schedule.id} className="schedule-item">
            <div className="schedule-content">
              <div className="schedule-title">{schedule.title}</div>
              <div className="schedule-time">
                🕐 {formatDateTime(start)} - {formatDateTime(end)}
              </div>
              {schedule.description && (
                <div className="schedule-desc">{schedule.description}</div>
              )}
            </div>
            <div className="schedule-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(schedule)}>
                编辑
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(schedule.id)}>
                删除
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
