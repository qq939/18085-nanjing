import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import type { Schedule } from '../types'

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_time', { ascending: true })
      
      if (error) throw error
      setSchedules(data || [])
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
      const { error } = await supabase
        .from('schedules')
        .insert([schedule])
      
      if (error) throw error
      await fetchSchedules()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '添加失败'
      return { success: false, error: message }
    }
  }, [fetchSchedules])

  const updateSchedule = useCallback(async (id: string, schedule: Partial<Schedule>) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ ...schedule, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      await fetchSchedules()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败'
      return { success: false, error: message }
    }
  }, [fetchSchedules])

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchSchedules()
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除失败'
      return { success: false, error: message }
    }
  }, [fetchSchedules])

  useEffect(() => {
    console.log('[useSchedules] 开始连接 Supabase...')
    
    const channel = supabase
      .channel('schedules_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedules'
      }, (payload) => {
        console.log('[useSchedules] 数据库变更:', payload)
        fetchSchedules()
      })
      .subscribe((status) => {
        console.log('[useSchedules] 订阅状态:', status)
      })

    fetchSchedules()

    return () => {
      supabase.removeChannel(channel)
    }
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
