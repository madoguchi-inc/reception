'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.18)',
  padding: '32px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}

export default function QRScanPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const [qrReaderReady, setQrReaderReady] = useState(false)

  useEffect(() => {
    let scanner: any = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            await scanner.stop()
            setScanning(false)

            try {
              const res = await fetch('/api/reception/qr-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken: decodedText }),
              })
              const data = await res.json()
              if (data.success) {
                router.push(`/reception/waiting/${data.appointmentId}`)
              } else {
                setError(data.error || 'QRコードが無効です')
                setTimeout(() => {
                  scanner?.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    () => {}, () => {}
                  )
                }, 1500)
              }
            } catch {
              setError('通信エラーが発生しました')
              setTimeout(() => {
                scanner?.start(
                  { facingMode: 'environment' },
                  { fps: 10, qrbox: { width: 250, height: 250 } },
                  () => {}, () => {}
                )
              }, 1500)
            }
          },
          () => {}
        )
        setScanning(true)
        setQrReaderReady(true)
      } catch (err) {
        setError('カメラの起動に失敗しました。カメラの権限を確認してください。')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [router])

  const handleRetry = async () => {
    setError(null)
    if (scannerRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          () => {}, () => {}
        )
        setScanning(true)
      } catch {
        setError('カメラの再起動に失敗しました')
      }
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/reception')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500',
          marginBottom: '24px', padding: '4px 0',
        }}
      >
        ← 戻る
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.12)', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
        }}>
          📱
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
          QRコードをかざしてください
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
          招待メールに記載のQRコードを読み取ります
        </p>
      </div>

      {/* Scanner card */}
      <div style={glassCard}>
        <div id="qr-reader" style={{ borderRadius: '16px', overflow: 'hidden' }} />

        {scanning && (
          <div style={{
            marginTop: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#3b82f6',
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>スキャン中...</span>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              padding: '12px 16px', background: 'rgba(239,68,68,0.2)',
              borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500',
              marginBottom: '12px',
            }}>
              {error}
            </div>
            {(error.includes('カメラ') || error.includes('通信')) && (
              <button onClick={handleRetry} style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                border: 'none', background: 'white', color: '#0f172a',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
              }}>
                🔄 再試行
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
