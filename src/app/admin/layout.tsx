'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: '📊' },
  { name: '来訪履歴', href: '/admin/visitors', icon: '👥' },
  { name: '社員管理', href: '/admin/employees', icon: '🏢' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>
      {/* Sidebar */}
      <div
        style={{
          position: sidebarOpen ? 'fixed' : undefined,
          inset: sidebarOpen ? '0' : undefined,
          zIndex: sidebarOpen ? 50 : undefined,
          width: '240px',
          minWidth: '240px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          ...(typeof window !== 'undefined' && window.innerWidth < 768
            ? { transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }
            : {}),
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '16px',
            }}>
              MR
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>MadoReception</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>管理コンソール</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.2s',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.name}</span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto', width: '6px', height: '6px',
                    borderRadius: '50%', background: '#3b82f6',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/reception"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '10px',
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px',
              fontWeight: '500',
            }}
          >
            <span style={{ fontSize: '16px' }}>🖥</span>
            受付画面を開く
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          background: 'white', padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '24px', padding: '4px',
            }}
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '6px 14px', background: '#f0f2f5', borderRadius: '8px',
              fontSize: '13px', color: '#64748b', fontWeight: '500',
            }}>
              {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 40,
          }}
        />
      )}
    </div>
  );
}
