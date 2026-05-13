import { useCallback, useEffect, useState } from 'react'
import type { Arrow, ConnectorSide } from '../types'
import { apiPath } from '../utils/api'
import { createId } from '../utils/id'

const API_PATH = apiPath('api/arrows')

async function saveArrows(arrows: Arrow[]) {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arrows }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '保存 arrows.csv 失败' }))
    throw new Error(error.error || '保存 arrows.csv 失败')
  }
}

export function useArrows() {
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArrows = useCallback(async () => {
    try {
      const response = await fetch(API_PATH)
      if (!response.ok) throw new Error('读取 arrows.csv 失败')

      const data = await response.json() as Arrow[]
      setArrows(data)
      setError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取箭头失败'
      setError(message)
      console.error('获取箭头失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addArrow = useCallback(async (
    sourceScheduleId: string,
    sourceSide: ConnectorSide,
    targetScheduleId: string,
    targetSide: ConnectorSide,
  ) => {
    try {
      const now = new Date().toISOString()
      const nextArrow: Arrow = {
        id: createId(),
        source_schedule_id: sourceScheduleId,
        source_side: sourceSide,
        target_schedule_id: targetScheduleId,
        target_side: targetSide,
        created_at: now,
        updated_at: now,
      }
      const nextArrows = [...arrows, nextArrow]

      await saveArrows(nextArrows)
      setArrows(nextArrows)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '添加箭头失败'
      return { success: false, error: message }
    }
  }, [arrows])

  const removeArrowsForSchedule = useCallback(async (scheduleId: string) => {
    const nextArrows = arrows.filter(arrow =>
      arrow.source_schedule_id !== scheduleId && arrow.target_schedule_id !== scheduleId
    )

    if (nextArrows.length === arrows.length) return { success: true }

    try {
      await saveArrows(nextArrows)
      setArrows(nextArrows)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除关联箭头失败'
      return { success: false, error: message }
    }
  }, [arrows])

  const removeArrow = useCallback(async (arrowId: string) => {
    const nextArrows = arrows.filter(arrow => arrow.id !== arrowId)

    if (nextArrows.length === arrows.length) return { success: true }

    try {
      await saveArrows(nextArrows)
      setArrows(nextArrows)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除箭头失败'
      return { success: false, error: message }
    }
  }, [arrows])

  useEffect(() => {
    fetchArrows()
  }, [fetchArrows])

  return {
    arrows,
    loading,
    error,
    fetchArrows,
    addArrow,
    removeArrow,
    removeArrowsForSchedule,
  }
}
