import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background Office Photo */}
      <Image
        src="/office.jpg"
        alt="Office"
        fill
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
        }}
      >
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

        {/* Main CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '340px',
            margin: '0 auto',
          }}
        >
          <Link
            href="/reception"
            style={{
              display: 'block',
              padding: '18px 32px',
              background: 'white',
              color: '#0f172a',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: '600',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              letterSpacing: '1px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            受付をはじめる
          </Link>

          <Link
            href="/admin"
            style={{
              display: 'block',
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            管理画面
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          position: 'absolute',
          bottom: '20px',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '12px',
          zIndex: 2,
          letterSpacing: '1px',
        }}
      >
        madoguchi株式会社
      </p>
    </div>
  );
}
