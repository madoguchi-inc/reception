'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Mock data
const mockVisitors = [
  {
    id: 1,
    date: '2026-02-27 09:30',
    name: '山田 太郎',
    company: 'ABC株式会社',
    host: '佐藤 花子',
    purpose: '営業打ち合わせ',
    duration: '1時間 15分',
    status: 'completed',
  },
  {
    id: 2,
    date: '2026-02-27 10:15',
    name: '鈴木 美咲',
    company: 'XYZ株式会社',
    host: '渡辺 次郎',
    purpose: '契約更新',
    duration: '45分',
    status: 'completed',
  },
  {
    id: 3,
    date: '2026-02-27 11:00',
    name: '高橋 健太',
    company: 'DEF株式会社',
    host: '佐藤 花子',
    purpose: '技術相談',
    duration: '1時間 30分',
    status: 'waiting',
  },
  {
    id: 4,
    date: '2026-02-26 14:00',
    name: '伊藤 由美',
    company: 'GHI株式会社',
    host: '田中 次郎',
    purpose: '提案説明',
    duration: '2時間',
    status: 'completed',
  },
  {
    id: 5,
    date: '2026-02-26 15:30',
    name: '佐々木 拓也',
    company: 'JKL株式会社',
    host: '渡辺 次郎',
    purpose: '打ち合わせ',
    duration: '1時間',
    status: 'completed',
  },
  {
    id: 6,
    date: '2026-02-25 10:00',
    name: '中村 直美',
    company: 'MNO株式会社',
    host: '佐藤 花子',
    purpose: '初回面談',
    duration: '1時間 45分',
    status: 'completed',
  },
  {
    id: 7,
    date: '2026-02-25 13:00',
    name: '小林 隆一',
    company: 'PQR株式会社',
    host: '渡辺 次郎',
    purpose: 'デモンストレーション',
    duration: '1時間 30分',
    status: 'completed',
  },
  {
    id: 8,
    date: '2026-02-24 11:00',
    name: '加藤 里美',
    company: 'STU株式会社',
    host: '田中 次郎',
    purpose: '契約締結',
    duration: '50分',
    status: 'completed',
  },
  {
    id: 9,
    date: '2026-02-24 14:30',
    name: '渡部 健太',
    company: 'VWX株式会社',
    host: '佐藤 花子',
    purpose: 'フォローアップ',
    duration: '1時間',
    status: 'completed',
  },
  {
    id: 10,
    date: '2026-02-23 09:00',
    name: '村田 由紀',
    company: 'YZA株式会社',
    host: '渡辺 次郎',
    purpose: '営業提案',
    duration: '2時間',
    status: 'completed',
  },
];

const ITEMS_PER_PAGE = 5;

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
          完了
        </span>
      );
    case 'waiting':
      return (
        <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
          待機中
        </span>
      );
    default:
      return null;
  }
}

export default function VisitorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVisitors = mockVisitors.filter((visitor) => {
    const matchesSearch =
      visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.company.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredVisitors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVisitors = filteredVisitors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleExportCSV = () => {
    const headers = ['日時', '来訪者', '会社名', '担当者', '目的', '滞在時間', 'ステータス'];
    const rows = filteredVisitors.map((v) => [
      v.date,
      v.name,
      v.company,
      v.host,
      v.purpose,
      v.duration,
      v.status === 'completed' ? '完了' : '待機中',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
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
            合計 {filteredVisitors.length} 件の来訪記録
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Download size={20} />
          CSVエクスポート
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="来訪者名または会社名で検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">全期間</option>
              <option value="today">今日</option>
              <option value="week">今週</option>
              <option value="month">今月</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-3 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
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
                  目的
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  滞在時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedVisitors.length > 0 ? (
                paginatedVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {visitor.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {visitor.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.host}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.purpose}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {visitor.duration}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(visitor.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    来訪記録が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {paginatedVisitors.length > 0 ? (
              <>
                {startIndex + 1} - {startIndex + paginatedVisitors.length} of{' '}
                {filteredVisitors.length}
              </>
            ) : (
              '0件'
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              前へ
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
