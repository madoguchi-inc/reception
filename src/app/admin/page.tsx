'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Check,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

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

const statusLabels: Record<string, string> = {
  CHECKED_IN: 'チェックイン済み',
  NOTIFIED: '通知済み',
  COMPLETED: '完了',
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
    const interval = setInterval(fetchData, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const statCards = stats
    ? [
        { label: '本日の来訪数', value: stats.todayCount, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'チェックイン中', value: stats.checkedInCount + stats.notifiedCount, icon: Clock, color: 'bg-amber-50', iconColor: 'text-amber-600' },
        { label: '完了', value: stats.completedCount, icon: CheckCircle2, color: 'bg-green-50', iconColor: 'text-green-600' },
        { label: '今週の来訪数', value: stats.weekCount, icon: Check, color: 'bg-gray-50', iconColor: 'text-gray-600' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">
            今日は
            {new Date().toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            です
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw size={18} />
          更新
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.color} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/employees"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            社員管理
          </Link>
          <Link
            href="/admin/visitors"
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            来訪履歴
          </Link>
        </div>
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            最近の来訪 ({recentVisits.length}件)
          </h2>
          <Link
            href="/admin/visitors"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            すべて見る
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
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
              {recentVisits.length > 0 ? (
                recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(visit.createdAt).toLocaleString('ja-JP', {
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
                        visit.status === 'COMPLETED'
                          ? 'text-green-700 bg-green-100'
                          : visit.status === 'NOTIFIED'
                          ? 'text-blue-700 bg-blue-100'
                          : 'text-amber-700 bg-amber-100'
                      }`}>
                        {statusLabels[visit.status] || visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
