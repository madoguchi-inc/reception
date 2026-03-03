'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ReceptionHome() {
  const router = useRouter()

  return (
    <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
      {/* Company logo - big and centered */}
      <div style={{ marginBottom: '32px' }}>
        <Image
          src="/logo.svg"
          alt="まどぐち株式会社"
          width={360}
          height={111}
          priority
          style={{
            height: 'auto',
            width: '320px',
            maxWidth: '80vw',
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* Welcome text */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '8px',
          margin: '0 0 16px',
          textTransform: 'uppercase' as const,
        }}>
          RECEPTION
        </p>
        <h1 style={{
          fontSize: '44px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px',
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          ようこそ
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.5)',
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
        background: 'rgba(255,255,255,0.2)',
        margin: '0 auto 40px',
        borderRadius: '1px',
      }} />

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxWidth: '360px',
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
