import { useState, useEffect, useCallback } from 'react'
import type { Schedule } from '../types'
import { apiPath } from '../utils/api'
import { createId } from '../utils/id'

const API_PATH = apiPath('api/schedules')

async function saveSchedules(schedules: Schedule[]) {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedules }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '保存 schedules.csv 失败' }))
    throw new Error(error.error || '保存 schedules.csv 失败')
  }
}

function createSchedule(data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Schedule {
  const now = new Date().toISOString()

  return {
    ...data,
    id: createId(),
    created_at: now,
    updated_at: now,
  }
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch(API_PATH)
      if (!response.ok) throw new Error('读取 schedules.csv 失败')

      const data = await response.json() as Schedule[]
      setSchedules(
        data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      )
      setError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取数据失败'
      setError(message)
      console.error('获取数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const nextSchedules = [...schedules, createSchedule(schedule)]
      await saveSchedules(nextSchedules)
      setSchedules(nextSchedules.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '添加失败'
      return { success: false, error: message }
    }
  }, [schedules])

  const updateSchedule = useCallback(async (id: string, data: { title: string; description: string | null; start_time: string; end_time: string }) => {
    try {
      const nextSchedules = schedules.map(schedule =>
        schedule.id === id
          ? { ...schedule, ...data, updated_at: new Date().toISOString() }
          : schedule
      )
      await saveSchedules(nextSchedules)
      setSchedules(nextSchedules.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败'
      return { success: false, error: message }
    }
  }, [schedules])

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const nextSchedules = schedules.filter(schedule => schedule.id !== id)
      await saveSchedules(nextSchedules)
      setSchedules(nextSchedules)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除失败'
      return { success: false, error: message }
    }
  }, [schedules])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
