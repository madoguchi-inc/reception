'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { initAudioOnInteraction } from '@/lib/sound'

export default function ReceptionHome() {
  const router = useRouter()

  // iOS Safari 対策: 最初のタップで AudioContext を初期化
  useEffect(() => {
    initAudioOnInteraction()
  }, [])

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center',
      color: 'white',
      padding: '24px',
    }}>
      {/* Company Logo */}
      <div style={{ marginBottom: '48px' }}>
        <Image
          src="/logo.svg"
          alt="まどぐち株式会社"
          width={360}
          height={111}
          priority
          style={{
            maxWidth: '80%',
            height: 'auto',
            margin: '0 auto',
            display: 'block',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          width: '48px',
          height: '2px',
          background: 'rgba(255,255,255,0.3)',
          margin: '0 auto 32px',
          borderRadius: '1px',
        }}
      />

      {/* Welcome text */}
      <h1
        style={{
          fontSize: '36px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px',
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        ようこそ
      </h1>
      <p
        style={{
          fontSize: '20px',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.85)',
          margin: '0 0 56px',
          letterSpacing: '4px',
        }}
      >
        RECEPTION
      </p>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '340px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => router.push('/reception/checkin')}
          style={{
            display: 'block',
            padding: '18px 32px',
            background: 'white',
            color: '#0f172a',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            letterSpacing: '1px',
          }}
        >
          受付
        </button>

        <button
          onClick={() => router.push('/reception/qr')}
          style={{
            display: 'block',
            padding: '14px 32px',
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          QRコードで受付
        </button>
      </div>
    </div>
  )
}
