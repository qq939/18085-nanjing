import { useState, useMemo } from 'react'
import type { Schedule } from '../types'

interface Props {
  schedules: Schedule[]
}

export function StatsBar({ schedules }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('all')

  const stats = useMemo(() => {
    const total = schedules.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCount = schedules.filter(s => {
      const start = new Date(s.start_time)
      return start >= today && start < tomorrow
    }).length

    return { total, todayCount }
  }, [schedules])

  return (
    <div className="stats-bar">
      <button
        className={`stat-tab ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => setActiveTab('all')}
      >
        总日程 <span className="stat-num">{stats.total}</span>
      </button>
      <button
        className={`stat-tab ${activeTab === 'today' ? 'active' : ''}`}
        onClick={() => setActiveTab('today')}
      >
        今日 <span className="stat-num">{stats.todayCount}</span>
      </button>
    </div>
  )
}

export function useScheduleFilter(schedules: Schedule[]) {
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('all')

  const filtered = useMemo(() => {
    if (activeTab === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return schedules.filter(s => {
        const start = new Date(s.start_time)
        return start >= today && start < tomorrow
      })
    }
    return schedules
  }, [schedules, activeTab])

  return { filtered, activeTab, setActiveTab }
}
