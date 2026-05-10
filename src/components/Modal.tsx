import { useState } from 'react'

interface Props {
  message: string
  type?: 'success' | 'error'
}

export function Toast({ message, type = 'success' }: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible || !message) return null

  setTimeout(() => setVisible(false), 3000)

  return (
    <div className={`toast ${type} ${visible ? 'show' : ''}`}>
      {message}
    </div>
  )
}

interface DeleteModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteModal({ onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="modal-overlay show">
      <div className="modal">
        <h3>确认删除</h3>
        <p>确定要删除这个日程吗？此操作无法撤销。</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>取消</button>
          <button className="btn btn-danger" onClick={onConfirm}>删除</button>
        </div>
      </div>
    </div>
  )
}
