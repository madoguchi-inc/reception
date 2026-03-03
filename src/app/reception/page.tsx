'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ReceptionHome() {
  const router = useRouter()

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: 'calc(100vh - 100px)',
    }}>
      {/* Upper area: Logo + Welcome text */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '0',
        paddingBottom: '40px',
      }}>
        {/* Company logo - large */}
        <Image
          src="/logo.svg"
          alt="まどぐち株式会社"
          width={360}
          height={111}
          priority
          style={{
            height: 'auto',
            width: '360px',
            maxWidth: '80vw',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.35))',
            marginBottom: '36px',
          }}
        />

        {/* Welcome text */}
        <p style={{
          fontSize: '11px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '8px',
          margin: '0 0 14px',
          textTransform: 'uppercase' as const,
        }}>
          RECEPTION
        </p>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px',
          textShadow: '0 2px 16px rgba(0,0,0,0.35)',
        }}>
          ようこそ
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          margin: '0',
          fontWeight: '300',
          letterSpacing: '1px',
        }}>
          Welcome to our office
        </p>
      </div>

      {/* Bottom: Liquid glass bar with buttons */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          gap: '14px',
          width: '100%',
        }}>
          <button
            onClick={() => router.push('/reception/checkin')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '22px 24px',
              background: 'white',
              color: '#0f172a',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              letterSpacing: '1px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <span style={{ fontSize: '22px' }}>👤</span>
            受付
          </button>

          <button
            onClick={() => router.push('/reception/qr')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '22px 24px',
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              letterSpacing: '1px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <span style={{ fontSize: '22px' }}>📱</span>
            QRコードで受付
          </button>
        </div>
      </div>
    </div>
  )
}
