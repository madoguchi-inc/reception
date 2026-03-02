'use client';

import { useState, useEffect } from 'react';

interface Visit {
  id: string;
  visitorName: string;
  visitorCompany: string | null;
  purpose: string;
  status: string;
  createdAt: string;
  notifiedAt: string | null;
  completedAt: string | null;
  employee: { name: string; department: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const purposeLabels: Record<string, string> = {
  meeting: '打ち合わせ',
  interview: '面接',
  delivery: '配達',
  other: 'その他',
};

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  CHECKED_IN: { label: 'チェックイン', bg: '#fef3c7', color: '#92400e', icon: '🟡' },
  NOTIFIED: { label: '通知済み', bg: '#dbeafe', color: '#1e40af', icon: '🔵' },
  COMPLETED: { label: '完了', bg: '#d1fae5', color: '#065f46', icon: '🟢' },
};

export default function VisitorsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchVisits = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/visitors?${params}`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch visits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisits(currentPage, searchQuery); }, [currentPage]);

  const handleSearch = () => { setCurrentPage(1); fetchVisits(1, searchQuery); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleExportCSV = () => {
    const headers = ['日時', '来訪者', '会社名', '担当者', '目的', 'ステータス'];
    const rows = visits.map((v) => [
      new Date(v.createdAt).toLocaleString('ja-JP'),
      v.visitorName,
      v.visitorCompany || '',
      v.employee?.name || '',
      purposeLabels[v.purpose] || v.purpose,
      statusConfig[v.status]?.label || v.status,
    ]);
    const csv = '\uFEFF' + [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            来訪履歴
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            合計 {pagination.total} 件の来訪記録
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={visits.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            background: visits.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #64748b, #475569)',
            color: 'white', fontSize: '14px', fontWeight: '600',
            cursor: visits.length === 0 ? 'default' : 'pointer',
            boxShadow: visits.length > 0 ? '0 4px 12px rgba(100,116,139,0.3)' : 'none',
          }}
        >
          📥 CSVエクスポート
        </button>
      </div>

      {/* Search */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '16px',
        border: '1px solid #f1f5f9', marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="🔍 来訪者名または会社名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: '10px',
              border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            }}
          >
            検索
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6', borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
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
                {visits.length > 0 ? visits.map((visit) => {
                  const sc = statusConfig[visit.status] || { label: visit.status, bg: '#f1f5f9', color: '#475569', icon: '⚪' };
                  return (
                    <tr key={visit.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                        {new Date(visit.createdAt).toLocaleString('ja-JP', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                          {visit.visitorName}
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                        {visit.visitorCompany || '—'}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        {visit.employee ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{visit.employee.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{visit.employee.department}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                        {purposeLabels[visit.purpose] || visit.purpose}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 12px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: '600',
                          background: sc.bg, color: sc.color,
                        }}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                      <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: 0 }}>来訪記録が見つかりません</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '20px', padding: '0 4px',
        }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} / {pagination.total}件
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: '1px solid #e2e8f0', background: 'white',
                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                fontSize: '13px', fontWeight: '500', cursor: currentPage === 1 ? 'default' : 'pointer',
              }}
            >
              ← 前へ
            </button>
            <span style={{
              padding: '8px 14px', borderRadius: '10px', background: '#f1f5f9',
              fontSize: '13px', fontWeight: '600', color: '#334155',
            }}>
              {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: '1px solid #e2e8f0', background: 'white',
                color: currentPage === pagination.totalPages ? '#cbd5e1' : '#334155',
                fontSize: '13px', fontWeight: '500',
                cursor: currentPage === pagination.totalPages ? 'default' : 'pointer',
              }}
            >
              次へ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
