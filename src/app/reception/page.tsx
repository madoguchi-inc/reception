'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ReceptionHome() {
  const router = useRouter()

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0',
    }}>
      {/* Company logo */}
      <Image
        src="/logo.svg"
        alt="まどぐち株式会社"
        width={360}
        height={111}
        priority
        style={{
          height: 'auto',
          width: '260px',
          maxWidth: '70vw',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))',
          marginBottom: '28px',
        }}
      />

      {/* Welcome text */}
      <p style={{
        fontSize: '12px',
        fontWeight: '400',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '6px',
        margin: '0 0 12px',
        textTransform: 'uppercase' as const,
      }}>
        RECEPTION
      </p>
      <h1 style={{
        fontSize: '36px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 6px',
        textShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        ようこそ
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.45)',
        margin: '0 0 36px',
        fontWeight: '300',
      }}>
        Welcome to our office
      </p>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '340px',
      }}>
        <button
          onClick={() => router.push('/reception/checkin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 32px',
            background: 'white',
            color: '#0f172a',
            borderRadius: '16px',
            fontSize: '19px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            letterSpacing: '1px',
          }}
        >
          <span style={{ fontSize: '22px' }}>👤</span>
          受付
        </button>

        <button
          onClick={() => router.push('/reception/qr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 32px',
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: '16px',
            fontSize: '19px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            letterSpacing: '1px',
          }}
        >
          <span style={{ fontSize: '22px' }}>📱</span>
          QRコードで受付
        </button>
      </div>
    </div>
  )
}
