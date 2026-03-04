'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createPeerConnection } from '@/lib/webrtc'

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

export default function CallPage() {
  const router = useRouter()
  const params = useParams()
  const visitId = params.visitId as string

  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended' | 'error'>('connecting')
  const [duration, setDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [visitorName, setVisitorName] = useState('')

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const offerRetryRef = useRef<NodeJS.Timeout | null>(null)
  const answerReceivedRef = useRef(false)

  const endCall = useCallback(async () => {
    if (status === 'ended') return
    setStatus('ended')
    if (timerRef.current) clearInterval(timerRef.current)
    if (offerRetryRef.current) clearInterval(offerRetryRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (pcRef.current) pcRef.current.close()
    if (channelRef.current) channelRef.current.unsubscribe()

    try {
      await fetch('/api/reception/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, action: 'call_ended' }),
      })
    } catch { /* ignore */ }
  }, [visitId, status])

  useEffect(() => {
    // Fetch visitor info
    fetch(`/api/reception/status/${visitId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVisitorName(d.appointment.visitorName) })
      .catch(() => {})

    const init = async () => {
      try {
        // マイク取得
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        streamRef.current = stream

        const pc = createPeerConnection()
        pcRef.current = pc

        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        pc.ontrack = (ev) => {
          if (audioRef.current) audioRef.current.srcObject = ev.streams[0]
        }

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setStatus('connected')
            if (offerRetryRef.current) clearInterval(offerRetryRef.current)
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            endCall()
          }
        }

        // Supabase Realtime シグナリング
        const channel = supabase.channel(`call:${visitId}`)
        channelRef.current = channel

        channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (pc.signalingState === 'have-local-offer') {
            answerReceivedRef.current = true
            if (offerRetryRef.current) clearInterval(offerRetryRef.current)
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
          }
        })

        channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)) } catch {}
        })

        // 通話終了シグナル
        channel.on('broadcast', { event: 'end-call' }, () => { endCall() })

        // 受信側が準備完了を通知してきたら、Offerを再送信
        channel.on('broadcast', { event: 'receiver-ready' }, () => {
          if (!answerReceivedRef.current && pc.localDescription) {
            console.log('Receiver ready, resending offer')
            channel.send({
              type: 'broadcast',
              event: 'offer',
              payload: { offer: pc.localDescription },
            })
          }
        })

        await channel.subscribe()

        // ICE candidates を送信
        pc.onicecandidate = (ev) => {
          if (ev.candidate) {
            channel.send({ type: 'broadcast', event: 'ice-candidate', payload: { candidate: ev.candidate } })
          }
        }

        // Offer 作成＆送信
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channel.send({ type: 'broadcast', event: 'offer', payload: { offer } })

        // 受信側がまだ参加していない可能性があるため、
        // Answerが届くまで3秒ごとにOfferを再送信（最大30秒）
        let retryCount = 0
        const MAX_RETRIES = 10
        offerRetryRef.current = setInterval(() => {
          retryCount++
          if (answerReceivedRef.current || retryCount >= MAX_RETRIES) {
            if (offerRetryRef.current) clearInterval(offerRetryRef.current)
            if (!answerReceivedRef.current && retryCount >= MAX_RETRIES) {
              console.error('Call timeout: no answer received')
              setStatus('error')
              setErrorMsg('来訪者との接続がタイムアウトしました。\nもう一度お試しください。')
            }
            return
          }
          console.log(`Retrying offer (${retryCount}/${MAX_RETRIES})`)
          channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { offer: pc.localDescription },
          })
        }, 3000)

      } catch (err) {
        console.error('Call init error:', err)
        setStatus('error')
        setErrorMsg('マイクへのアクセスが拒否されました。\nブラウザの設定でマイクを許可してください。')
      }
    }

    init()
    return () => { endCall() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (status === 'error') {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={glassCard}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f87171', margin: '0 0 12px' }}>
            接続エラー
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 28px', whiteSpace: 'pre-line' }}>
            {errorMsg}
          </p>
          <button
            onClick={() => router.push('/reception')}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px',
              border: 'none', background: 'white', color: '#0f172a',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  if (status === 'ended') {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
        <div style={glassCard}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#4ade80', margin: '0 0 8px' }}>
            通話終了
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 28px' }}>
            通話時間: {formatTime(duration)}
          </p>
          <button
            onClick={() => window.close()}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px',
              border: 'none', background: 'white', color: '#0f172a',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
      <div style={glassCard}>
        {/* Avatar pulse */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: status === 'connected' ? 'rgba(74,222,128,0.2)' : 'rgba(59,130,246,0.15)',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px',
          animation: status === 'connecting' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}>
          📞
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>
          {status === 'connected' ? '通話中' : '接続中...'}
        </h2>

        {visitorName && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 12px' }}>
            {visitorName}様
          </p>
        )}

        <p style={{
          fontSize: '36px', fontWeight: '700',
          color: status === 'connected' ? '#4ade80' : 'rgba(255,255,255,0.4)',
          margin: '0 0 36px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTime(duration)}
        </p>

        <audio ref={audioRef} autoPlay playsInline />

        <button
          onClick={endCall}
          style={{
            width: '100%', padding: '18px', borderRadius: '14px',
            border: 'none', background: '#ef4444', color: 'white',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
          }}
        >
          通話を終了
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
          50% { box-shadow: 0 0 0 20px rgba(59,130,246,0); }
        }
      `}</style>
    </div>
  )
}
