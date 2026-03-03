'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

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
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
      onTouchStart={handleActivity}
      onMouseMove={handleActivity}
      onClick={handleActivity}
    >
      {/* Background Office Photo */}
      <Image
        src="/office.jpg"
        alt="Office"
        fill
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.55) 40%, rgba(15,23,42,0.75) 100%)',
          zIndex: 1,
        }}
      />

      {/* Header with clock and logo */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Image
          src="/logo.svg"
          alt="まどぐち株式会社"
          width={160}
          height={49}
          priority
          style={{
            height: '32px',
            width: 'auto',
            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))',
            opacity: 0.9,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '400',
          }}>
            {currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.8)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '1px',
          }}>
            {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px 32px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
