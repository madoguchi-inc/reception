'use client'
import { useRouter } from 'next/navigation'

export default function ReceptionHome() {
  const router = useRouter()

  return (
    <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
      {/* Welcome text */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontSize: '16px',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '6px',
          margin: '0 0 12px',
          textTransform: 'uppercase' as const,
        }}>
          RECEPTION
        </p>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px',
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          ようこそ
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          fontWeight: '300',
        }}>
          Welcome to our office
        </p>
      </div>

      {/* Divider */}
      <div style={{
        width: '48px',
        height: '2px',
        background: 'rgba(255,255,255,0.25)',
        margin: '0 auto 48px',
        borderRadius: '1px',
      }} />

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '380px',
        margin: '0 auto',
      }}>
        <button
          onClick={() => router.push('/reception/checkin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '22px 32px',
            background: 'white',
            color: '#0f172a',
            borderRadius: '16px',
            fontSize: '20px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            letterSpacing: '1px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>👤</span>
          受付
        </button>

        <button
          onClick={() => router.push('/reception/qr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '22px 32px',
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            fontSize: '20px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            letterSpacing: '1px',
            transition: 'transform 0.2s, background 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>📱</span>
          QRコードで受付
        </button>
      </div>
    </div>
  )
}
