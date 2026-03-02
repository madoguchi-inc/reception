'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  todayCount: number;
  weekCount: number;
  totalCount: number;
  checkedInCount: number;
  notifiedCount: number;
  completedCount: number;
}

interface RecentVisit {
  id: string;
  visitorName: string;
  visitorCompany: string | null;
  purpose: string;
  status: string;
  createdAt: string;
  employee: { name: string; department: string } | null;
}

const purposeLabels: Record<string, string> = {
  meeting: '打ち合わせ',
  interview: '面接',
  delivery: '配達',
  other: 'その他',
};

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  CHECKED_IN: { label: 'チェックイン済', bg: '#fef3c7', color: '#92400e' },
  NOTIFIED: { label: '通知済み', bg: '#dbeafe', color: '#1e40af' },
  COMPLETED: { label: '完了', bg: '#d1fae5', color: '#065f46' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentVisits(data.recentVisits || []);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = stats ? [
    { label: '本日の来訪', value: stats.todayCount, icon: '👋', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', lightBg: '#eff6ff' },
    { label: '対応中', value: stats.checkedInCount + stats.notifiedCount, icon: '⏳', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', lightBg: '#fffbeb' },
    { label: '対応完了', value: stats.completedCount, icon: '✅', gradient: 'linear-gradient(135deg, #10b981, #059669)', lightBg: '#ecfdf5' },
    { label: '今週の来訪', value: stats.weekCount, icon: '📅', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', lightBg: '#f5f3ff' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            ダッシュボード
          </h1>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0',
              background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            🔄 更新
          </button>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px', marginBottom: '32px',
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.3px' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: card.lightBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
          クイックアクション
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Link href="/admin/employees" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 24px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white', fontWeight: '600', fontSize: '14px',
            textDecoration: 'none', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            🏢 社員管理
          </Link>
          <Link href="/admin/visitors" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 24px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #64748b, #475569)',
            color: 'white', fontWeight: '600', fontSize: '14px',
            textDecoration: 'none', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(100,116,139,0.3)',
          }}>
            👥 来訪履歴
          </Link>
          <Link href="/reception" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 24px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontWeight: '600', fontSize: '14px',
            textDecoration: 'none', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          }}>
            🖥 受付画面
          </Link>
        </div>
      </div>

      {/* Recent Visits */}
      <div style={{
        background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            最近の来訪
          </h2>
          <Link href="/admin/visitors" style={{
            fontSize: '13px', fontWeight: '600', color: '#3b82f6',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            すべて見る →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['日時', '来訪者', '会社名', '担当者', '用件', 'ステータス'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 24px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '600', color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentVisits.length > 0 ? recentVisits.map((visit) => {
                const sc = statusConfig[visit.status] || { label: visit.status, bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                      {new Date(visit.createdAt).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                      {visit.visitorName}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                      {visit.visitorCompany || '—'}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                      {visit.employee?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                      {purposeLabels[visit.purpose] || visit.purpose}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '600',
                        background: sc.bg, color: sc.color,
                      }}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    来訪記録がまだありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
