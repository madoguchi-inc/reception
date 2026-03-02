'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, ArrowLeft, Camera, RefreshCw } from 'lucide-react'

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
            // Stop scanner immediately
            await scanner.stop()
            setScanning(false)

            // Process QR code
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
                // Restart scanner
                setTimeout(() => {
                  scanner?.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    () => {},
                    () => {}
                  )
                }, 1500)
              }
            } catch {
              setError('通信エラーが発生しました')
              // Restart scanner
              setTimeout(() => {
                scanner?.start(
                  { facingMode: 'environment' },
                  { fps: 10, qrbox: { width: 250, height: 250 } },
                  () => {},
                  () => {}
                )
              }, 1500)
            }
          },
          () => {} // ignore scan failures
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
          () => {},
          () => {}
        )
        setScanning(true)
      } catch {
        setError('カメラの再起動に失敗しました')
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => router.push('/reception')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">QRコードをかざしてください</h2>
        <p className="text-slate-500">招待メールに記載のQRコードを読み取ります</p>
      </div>

      {/* QR Scanner area */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <div id="qr-reader" className="rounded-2xl overflow-hidden" />

        {scanning && (
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">スキャン中...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
            {error.includes('カメラ') || error.includes('通信') ? (
              <button
                onClick={handleRetry}
                className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                再試行
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
