'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

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

export default function RespondPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'sending' | 'done' | 'error'>('sending')
  const [errorMsg, setErrorMsg] = useState('')
  const hasSent = useRef(false)

  const visitId = params.visitId as string
  const action = searchParams.get('action') || 'on_my_way'
  const config = actionConfig[action] || actionConfig.on_my_way

  // ページ読み込み時に自動で応答を送信
  useEffect(() => {
    if (hasSent.current) return
    hasSent.current = true

    const sendResponse = async () => {
      try {
        const res = await fetch('/api/reception/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitId, action }),
        })
        const data = await res.json()
        if (data.success) {
          setStatus('done')
          // 通話の場合は通話ページへリダイレクト
          if (action === 'call') {
            setTimeout(() => router.push(`/reception/call/${visitId}`), 1000)
          }
        } else {
          setStatus('error')
          setErrorMsg(data.error || '処理に失敗しました')
        }
      } catch {
        setStatus('error')
        setErrorMsg('通信エラーが発生しました')
      }
    }

    sendResponse()
  }, [visitId, action, router])

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
      <div style={glassCard}>
        {/* アイコン */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: status === 'error' ? 'rgba(239,68,68,0.2)' : `${config.color}33`,
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px',
        }}>
          {status === 'sending' ? '⏳' : status === 'error' ? '❌' : '✅'}
        </div>

        {/* ステータス表示 */}
        {status === 'sending' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
              送信中...
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              「{config.label}」を送信しています
            </p>
          </>
        )}

        {status === 'done' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: config.color, margin: '0 0 8px' }}>
              {config.label}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
              {action === 'call' ? '通話ページに移動します...' : '来訪者に通知されました'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ef4444', margin: '0 0 8px' }}>
              エラー
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 20px' }}>
              {errorMsg}
            </p>
            <button
              onClick={() => { hasSent.current = false; setStatus('sending'); window.location.reload() }}
              style={{
                padding: '12px 32px', borderRadius: '14px',
                border: 'none', background: 'white', color: '#0f172a',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              }}
            >
              再試行
            </button>
          </>
        )}
      </div>
    </div>
  )
}
