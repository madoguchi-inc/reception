'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createPeerConnection } from '@/lib/webrtc'

interface AppointmentInfo {
  visitorName: string
  visitorCompany?: string
  employeeName: string
  meetingRoom?: string
  status: string
  response?: string | null
  callStatus?: string | null
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
  const visitId = params.id as string

  const [info, setInfo] = useState<AppointmentInfo | null>(null)
  const [dots, setDots] = useState(0)
  const [loading, setLoading] = useState(true)

  // 通話関連
  const [callActive, setCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callConnected, setCallConnected] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const callInitiatedRef = useRef(false)

  // アニメーション
  useEffect(() => {
    const timer = setInterval(() => setDots(d => (d + 1) % 4), 500)
    return () => clearInterval(timer)
  }, [])

  // 通話終了
  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (pcRef.current) pcRef.current.close()
    if (channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'end-call', payload: {} })
      channelRef.current.unsubscribe()
    }
    setCallActive(false)
    setCallConnected(false)
    callInitiatedRef.current = false
    pcRef.current = null
    streamRef.current = null
    channelRef.current = null
  }, [])

  // WebRTC通話を受信側として開始
  const startCallAsReceiver = useCallback(async () => {
    if (callInitiatedRef.current) return
    callInitiatedRef.current = true
    setCallActive(true)

    try {
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
          setCallConnected(true)
          timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          endCall()
        }
      }

      const channel = supabase.channel(`call:${visitId}`)
      channelRef.current = channel

      // Offer受信 → Answer返信
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (pc.signalingState === 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          channel.send({ type: 'broadcast', event: 'answer', payload: { answer } })
        }
      })

      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)) } catch {}
      })

      channel.on('broadcast', { event: 'end-call' }, () => { endCall() })

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          channel.send({ type: 'broadcast', event: 'ice-candidate', payload: { candidate: ev.candidate } })
        }
      }

      await channel.subscribe()

      // チャンネル参加完了を通知 → スタッフ側がOfferを再送信してくれる
      channel.send({ type: 'broadcast', event: 'receiver-ready', payload: {} })
    } catch (err) {
      console.error('Call receiver error:', err)
      endCall()
    }
  }, [visitId, endCall])

  // ステータスポーリング
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/reception/status/${visitId}`)
        const data = await res.json()
        if (data.success) {
          setInfo(data.appointment)
          // 通話リクエスト検知
          if (data.appointment.callStatus === 'ringing' && !callInitiatedRef.current) {
            startCallAsReceiver()
          }
          // 通話終了検知
          if (data.appointment.callStatus === 'ended' && callInitiatedRef.current) {
            endCall()
          }
        }
      } catch (err) {
        console.error('Failed to fetch status:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [visitId, startCallAsReceiver, endCall])

  // 5分タイムアウト（通話中は無効化）
  useEffect(() => {
    if (callActive) return
    const timeout = setTimeout(() => router.push('/reception'), 300000)
    return () => clearTimeout(timeout)
  }, [router, callActive])

  const responseMessage = info?.response === 'on_my_way'
    ? '担当者が向かっております'
    : info?.response === 'please_wait'
    ? '少々お待ちください'
    : null

  const isRejected = info?.response === 'rejected'

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ======= 通話中UI =======
  if (callActive) {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
        <div style={glassCard}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: callConnected ? 'rgba(74,222,128,0.2)' : 'rgba(59,130,246,0.15)',
            margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px',
          }}>
            📞
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: callConnected ? '#4ade80' : 'white', margin: '0 0 4px' }}>
            {callConnected ? '通話中' : '接続中...'}
          </h2>

          {info && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 16px' }}>
              担当者: {info.employeeName}
            </p>
          )}

          <p style={{
            fontSize: '40px', fontWeight: '700',
            color: callConnected ? '#4ade80' : 'rgba(255,255,255,0.4)',
            margin: '0 0 40px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatTime(callDuration)}
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
      </div>
    )
  }

  // ======= 通常の待機UI =======
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

        {/* Footer */}
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
