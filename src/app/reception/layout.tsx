'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Idle detection - return to home after 60s
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (Date.now() - lastActivity > 60000 && pathname !== '/reception') {
        router.push('/reception')
      }
    }, 5000)
    return () => clearInterval(checkIdle)
  }, [lastActivity, pathname, router])

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden"
      onTouchStart={handleActivity}
      onMouseMove={handleActivity}
      onClick={handleActivity}
    >
      {/* Header with clock */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-slate-200/50">
        <div className="text-sm text-slate-400">
          {currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
        <div className="text-2xl font-light text-slate-500 tabular-nums">
          {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        {children}
      </div>
    </div>
  )
}
