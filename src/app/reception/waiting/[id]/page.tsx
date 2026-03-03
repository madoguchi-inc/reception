'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface AppointmentInfo {
  visitorName: string
  visitorCompany?: string
  employeeName: string
  meetingRoom?: string
  status: string
  response?: string
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.18)',
  padding: '48px 40px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  textAlign: 'center' as const,
}

export default function WaitingPage() {
  const router = useRouter()
  const params = useParams()
  const [info, setInfo] = useState<AppointmentInfo | null>(null)
  const [dots, setDots] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setDots(d => (d + 1) % 4), 500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/reception/status/${params.id}`)
        const data = await res.json()
        if (data.success) setInfo(data.appointment)
      } catch (err) {
        console.error('Failed to fetch status:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => {
    const timeout = setTimeout(() => router.push('/reception'), 300000)
    return () => clearTimeout(timeout)
  }, [router])

  const responseMessage = info?.response === 'on_my_way'
    ? '担当者が向かっております'
    : info?.response === 'please_wait'
    ? '少々お待ちください'
    : null

  const isRejected = info?.response === 'rejected'

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      <div style={glassCard}>
        {isRejected ? (
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.2)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px',
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
              申し訳ございません
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: '0 0 32px' }}>
              担当者が対応できない状況です。
            </p>
            <button
              onClick={() => router.push('/reception')}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px',
                border: 'none', background: 'white', color: '#0f172a',
                fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
              }}
            >
              ホームに戻る
            </button>
          </>
        ) : responseMessage ? (
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.2)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px',
            }}>
              ✅
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80', margin: '0 0 8px' }}>
              {responseMessage}
            </h2>
          </>
        ) : (
          <>
            {/* Animated waiting indicator */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(59,130,246,0.2)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', position: 'relative',
            }}>
              🕐
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
              お待ちください{'.'.repeat(dots)}
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              担当者に通知しております
            </p>
          </>
        )}

        {/* Visitor info */}
        {info && (
          <div style={{
            marginTop: '32px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'left',
          }}>
            {[
              { label: 'お名前', value: `${info.visitorName}様`, sub: info.visitorCompany },
              { label: '担当者', value: info.employeeName },
              ...(info.meetingRoom ? [{ label: '会議室', value: info.meetingRoom }] : []),
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 0',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '500', fontSize: '14px' }}>
                  {item.label}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{item.value}</span>
                  {'sub' in item && item.sub && (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer message */}
        {!responseMessage && !isRejected && (
          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
              5分以上お待ちの場合はお気軽にお声がけください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
