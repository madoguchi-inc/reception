'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

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

const statusConfig: Record<string, { label: string; class: string }> = {
  CHECKED_IN: { label: 'チェックイン', class: 'text-amber-700 bg-amber-100' },
  NOTIFIED: { label: '通知済み', class: 'text-blue-700 bg-blue-100' },
  COMPLETED: { label: '完了', class: 'text-green-700 bg-green-100' },
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

  useEffect(() => {
    fetchVisits(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchVisits(1, searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">来訪履歴</h1>
          <p className="mt-1 text-gray-600">
            合計 {pagination.total} 件の来訪記録
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={visits.length === 0}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Download size={20} />
          CSVエクスポート
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="来訪者名または会社名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            検索
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    来訪者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    会社名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    用件
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Date(visit.createdAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {visit.visitorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.visitorCompany || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visit.employee?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {purposeLabels[visit.purpose] || visit.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          statusConfig[visit.status]?.class || 'text-gray-700 bg-gray-100'
                        }`}>
                          {statusConfig[visit.status]?.label || visit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      来訪記録が見つかりません
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {(currentPage - 1) * pagination.limit + 1} -{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} / {pagination.total}件
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              前へ
            </button>
            <span className="flex items-center px-3 py-2 text-sm text-gray-600">
              {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              次へ
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
