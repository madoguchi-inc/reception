import Link from 'next/link';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 auto 24px',
          }}
        >
          MR
        </div>

        <h1
          style={{
            fontSize: '42px',
            fontWeight: '700',
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
          }}
        >
          MadoReception
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 48px',
          }}
        >
          まどぐち株式会社 受付システム
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '320px',
            margin: '0 auto',
          }}
        >
          <Link
            href="/reception"
            style={{
              display: 'block',
              padding: '16px 32px',
              background: 'white',
              color: '#1e3a5f',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            受付画面を開く
          </Link>

          <Link
            href="/admin"
            style={{
              display: 'block',
              padding: '16px 32px',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              textDecoration: 'none',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            管理画面
          </Link>
        </div>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: '24px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '13px',
        }}
      >
        Powered by まどぐち株式会社
      </p>
    </div>
  );
}
