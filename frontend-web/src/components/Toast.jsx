import { useState, useEffect, useMemo } from 'react'
import './Toast.css'

const Icon = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )
    case 'error':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      )
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
          <path d="M10.3 4.3l-8.6 15A2 2 0 0 0 3.4 22h17.2a2 2 0 0 0 1.7-2.7l-8.6-15a2 2 0 0 0-3.4 0z" />
        </svg>
      )
    case 'info':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 17v-6" />
          <path d="M12 7h.01" />
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )
  }
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
)

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Utilisé uniquement pour aria-live (et éviter d'annoncer des erreurs en "polite")
  const ariaLive = useMemo(() => (type === 'error' ? 'assertive' : 'polite'), [type])

  useEffect(() => {
    const enter = setTimeout(() => setIsVisible(true), 10)

    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(enter)
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible && !isLeaving) return null

  return (
    <div
      className={`toast toast-${type} ${isVisible && !isLeaving ? 'toast-enter' : ''} ${isLeaving ? 'toast-exit' : ''}`}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      <div className="toast-icon" aria-hidden="true">
        <Icon type={type} />
      </div>

      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>

      <button className="toast-close" onClick={handleClose} aria-label="Fermer la notification">
        <CloseIcon />
      </button>
    </div>
  )
}

export default Toast
