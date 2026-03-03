'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

interface VisitInfo {
  visitorName: string
  visitorCompany?: string
  purpose: string
  employeeName: string
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

const actionConfig: Record<string, { icon: string; label: string; color: string }> = {
  on_my_way: { icon: '🚶', label: '向かいます', color: '#4ade80' },
  please_wait: { icon: '🕐', label: '少々お待ちください', color: '#60a5fa' },
  call: { icon: '📞', label: '通話する', color: '#f59e0b' },
}

const purposeLabels: Record<string, string> = {
  meeting: '打ち合わせ',
  interview: '面接',
  delivery: '配達',
  other: 'その他',
}

export default function RespondPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [info, setInfo] = useState<VisitInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visitId = params.visitId as string
  const action = searchParams.get('action') || 'on_my_way'
  const config = actionConfig[action] || actionConfig.on_my_way

  useEffect(() => {
    const fetchVisitInfo = async () => {
      try {
        const res = await fetch(`/api/reception/status/${visitId}`)
        const data = await res.json()
        if (data.success && data.appointment) {
          setInfo({
            visitorName: data.appointment.visitorName,
            visitorCompany: data.appointment.visitorCompany,
            purpose: purposeLabels[data.appointment.purpose] || data.appointment.purpose,
            employeeName: data.appointment.employeeName,
          })
        } else {
          setError('訪問情報が見つかりません')
        }
      } catch {
        setError('通信エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    fetchVisitInfo()
  }, [visitId])

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/reception/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, action }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        if (action === 'call') {
          setTimeout(() => router.push(`/reception/call/${visitId}`), 1200)
        }
      } else {
        setError(data.error || '処理に失敗しました')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={glassCard}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: 0 }}>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={glassCard}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `${config.color}33`, margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
          }}>
            ✅
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: config.color, margin: '0 0 8px' }}>
            送信しました
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
            {action === 'call' ? '通話ページに移動します...' : '来訪者に通知されました'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
      <div style={glassCard}>
        {/* Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: `${config.color}33`, margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px',
        }}>
          {config.icon}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
          来訪者対応
        </h2>
        <p style={{ color: config.color, fontSize: '18px', fontWeight: '600', margin: '0 0 28px' }}>
          「{config.label}」で対応
        </p>

        {error && (
          <p style={{ color: '#fca5a5', fontSize: '14px', margin: '0 0 20px' }}>{error}</p>
        )}

        {/* Visit info */}
        {info && (
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: '16px',
            padding: '16px 20px', marginBottom: '28px', textAlign: 'left',
          }}>
            {[
              { label: 'お名前', value: `${info.visitorName}様` },
              ...(info.visitorCompany ? [{ label: '会社名', value: info.visitorCompany }] : []),
              { label: '用件', value: info.purpose },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.label}</span>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.close()}
            style={{
              flex: 1, padding: '16px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !!error}
            style={{
              flex: 2, padding: '16px', borderRadius: '14px',
              border: 'none', background: 'white', color: '#0f172a',
              fontSize: '15px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer',
              opacity: submitting || error ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
            }}
          >
            {submitting ? '処理中...' : `${config.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}
