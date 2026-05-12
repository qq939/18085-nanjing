import { useState } from 'react'
import { useSchedules } from './hooks/useSchedules'
import { ScheduleForm } from './components/ScheduleForm'
import { ScheduleList } from './components/ScheduleList'
import { StatsBar, useScheduleFilter } from './components/StatsBar'
import { Toast, DeleteModal } from './components/Modal'
import type { Schedule } from './types'
import './App.css'

export default function App() {
  const { schedules, loading, error: _error, addSchedule, updateSchedule, deleteSchedule } = useSchedules()
  const { filtered, activeTab: _activeTab, setActiveTab: _setActiveTab } = useScheduleFilter(schedules)
  
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (data: { title: string; description: string | null; start_time: string; end_time: string }) => {
    console.log('[App] handleSubmit, editingSchedule:', editingSchedule?.id, 'data:', data)
    if (editingSchedule) {
      const result = await updateSchedule(editingSchedule.id, data)
      if (result.success) {
        showToast('✅ 日程已更新')
        setEditingSchedule(null)
      } else {
        showToast('❌ ' + (result.error || '更新失败'), 'error')
      }
    } else {
      const result = await addSchedule(data)
      if (result.success) {
        showToast('✅ 日程已添加')
      } else {
        showToast('❌ ' + (result.error || '添加失败'), 'error')
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    const result = await deleteSchedule(deleteTargetId)
    if (result.success) {
      showToast('日程已删除')
    } else {
      showToast(result.error || '删除失败', 'error')
    }
    setDeleteTargetId(null)
  }

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📅 日程管理</h1>
      </header>

      <main className="main-grid">
        <section className="card form-section">
          <ScheduleForm
            schedule={editingSchedule}
            onSubmit={handleSubmit}
            onCancel={() => setEditingSchedule(null)}
          />
        </section>

        <section className="card schedule-section">
          <h2>📋 日程列表</h2>
          <StatsBar schedules={schedules} />
          <ScheduleList
            schedules={filtered}
            onEdit={setEditingSchedule}
            onDelete={(id) => setDeleteTargetId(id)}
          />
        </section>

        <section className="card travel-section">
          <h2>✈️ 旅行规划</h2>
          <iframe src="sidebar.html" title="旅行规划" />
        </section>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
      
      {deleteTargetId && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}
