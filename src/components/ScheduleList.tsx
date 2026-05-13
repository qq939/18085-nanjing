import { useLayoutEffect, useRef, useState } from 'react'
import type { Arrow, ConnectorSide, Schedule } from '../types'

interface Props {
  schedules: Schedule[]
  arrows: Arrow[]
  pendingConnector: { scheduleId: string; side: ConnectorSide } | null
  onEdit: (schedule: Schedule) => void
  onDelete: (id: string) => void
  onConnectorClick: (scheduleId: string, side: ConnectorSide) => void
  onArrowDelete: (arrowId: string) => void
}

interface ArrowPath {
  id: string
  d: string
  controlX: number
  controlY: number
}

function formatDateTime(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

export function ScheduleList({
  schedules,
  arrows,
  pendingConnector,
  onEdit,
  onDelete,
  onConnectorClick,
  onArrowDelete,
}: Props) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const connectorRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [arrowPaths, setArrowPaths] = useState<ArrowPath[]>([])
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null)
  const visibleScheduleIds = new Set(schedules.map(schedule => schedule.id))

  useLayoutEffect(() => {
    const updatePaths = () => {
      if (!canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const nextPaths = arrows
        .filter(arrow =>
          visibleScheduleIds.has(arrow.source_schedule_id) &&
          visibleScheduleIds.has(arrow.target_schedule_id)
        )
        .map(arrow => {
          const source = connectorRefs.current[`${arrow.source_schedule_id}:${arrow.source_side}`]
          const target = connectorRefs.current[`${arrow.target_schedule_id}:${arrow.target_side}`]

          if (!source || !target) return null

          const sourceRect = source.getBoundingClientRect()
          const targetRect = target.getBoundingClientRect()
          const startX = sourceRect.left + sourceRect.width / 2 - canvasRect.left
          const startY = sourceRect.top + sourceRect.height / 2 - canvasRect.top
          const endX = targetRect.left + targetRect.width / 2 - canvasRect.left
          const endY = targetRect.top + targetRect.height / 2 - canvasRect.top
          const bend = Math.max(Math.abs(endX - startX) * 0.45, 42)
          const sourceDirection = arrow.source_side === 'right' ? bend : -bend
          const targetDirection = arrow.target_side === 'right' ? bend : -bend
          const d = `M ${startX} ${startY} C ${startX + sourceDirection} ${startY}, ${endX + targetDirection} ${endY}, ${endX} ${endY}`
          const controlX = (startX + endX) / 2
          const controlY = (startY + endY) / 2

          return { id: arrow.id, d, controlX, controlY }
        })
        .filter((path): path is ArrowPath => Boolean(path))

      setArrowPaths(nextPaths)
    }

    updatePaths()
    window.addEventListener('resize', updatePaths)
    canvasRef.current?.addEventListener('scroll', updatePaths)

    return () => {
      window.removeEventListener('resize', updatePaths)
      canvasRef.current?.removeEventListener('scroll', updatePaths)
    }
  }, [arrows, schedules])

  if (schedules.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📭</div>
        <p>暂无日程，添加一个吧</p>
      </div>
    )
  }

  return (
    <div className="schedule-canvas" ref={canvasRef} onClick={() => setSelectedArrowId(null)}>
      <svg className="arrow-layer" aria-label="事项箭头线条">
        <defs>
          <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        {arrowPaths.map(path => (
          <g key={path.id}>
            <path
              className="arrow-hit-path"
              d={path.d}
              onClick={(event) => {
                event.stopPropagation()
                setSelectedArrowId(path.id)
              }}
            />
            <path
              className={`arrow-path${selectedArrowId === path.id ? ' selected' : ''}`}
              d={path.d}
              markerEnd="url(#arrow-head)"
            />
          </g>
        ))}
      </svg>

      {arrowPaths.map(path => (
        selectedArrowId === path.id && (
          <button
            key={`delete-${path.id}`}
            className="arrow-delete"
            style={{ left: path.controlX, top: path.controlY }}
            type="button"
            title="删除箭头"
            aria-label="删除箭头线条"
            onClick={(event) => {
              event.stopPropagation()
              onArrowDelete(path.id)
              setSelectedArrowId(null)
            }}
          >
            ×
          </button>
        )
      ))}

      <div className="schedule-list">
        {schedules.map((schedule) => {
          const start = new Date(schedule.start_time)
          const end = new Date(schedule.end_time)
          
          return (
            <div key={schedule.id} className="schedule-item">
              {(['left', 'right'] as ConnectorSide[]).map(side => {
                const isActive = pendingConnector?.scheduleId === schedule.id && pendingConnector.side === side

                return (
                  <button
                    key={side}
                    ref={(node) => {
                      connectorRefs.current[`${schedule.id}:${side}`] = node
                    }}
                    className={`connector connector-${side}${isActive ? ' active' : ''}`}
                    type="button"
                    title={side === 'left' ? '左侧连接点' : '右侧连接点'}
                    aria-label={`${schedule.title}${side === 'left' ? '左侧' : '右侧'}连接点`}
                    onClick={() => onConnectorClick(schedule.id, side)}
                  />
                )
              })}

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
    </div>
  )
}
