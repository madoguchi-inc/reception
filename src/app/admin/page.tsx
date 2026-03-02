'use client';

import { useState } from 'react';
import {
  Users,
  Check,
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

// Mock data
const mockStats = [
  { label: '本日の来訪予定数', value: 12, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'チェックイン済み', value: 8, icon: Check, color: 'bg-green-50', iconColor: 'text-green-600' },
  { label: '待機中', value: 3, icon: Clock, color: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: '完了', value: 1, icon: CheckCircle2, color: 'bg-gray-50', iconColor: 'text-gray-600' },
];

const mockUpcomingVisitors = [
  {
    id: 1,
    name: '山田 太郎',
    company: 'ABC株式会社',
    checkInTime: '09:30',
    host: '佐藤 花子',
    room: '会議室A',
    status: 'confirmed',
  },
  {
    id: 2,
    name: '鈴木 美咲',
    company: 'XYZ株式会社',
    checkInTime: '10:00',
    host: '渡辺 次郎',
    room: '会議室B',
    status: 'confirmed',
  },
  {
    id: 3,
    name: '高橋 健太',
    company: 'DEF株式会社',
    checkInTime: '11:00',
    host: '佐藤 花子',
    room: '会議室A',
    status: 'confirmed',
  },
  {
    id: 4,
    name: '伊藤 由美',
    company: 'GHI株式会社',
    checkInTime: '14:00',
    host: '田中 次郎',
    room: '会議室C',
    status: 'confirmed',
  },
  {
    id: 5,
    name: '佐々木 拓也',
    company: 'JKL株式会社',
    checkInTime: '15:30',
    host: '渡辺 次郎',
    room: '会議室B',
    status: 'confirmed',
  },
];

const mockActivityFeed = [
  {
    id: 1,
    type: 'checkin',
    visitor: '山田 太郎',
    company: 'ABC株式会社',
    time: '09:25',
    description: 'チェックイン完了',
  },
  {
    id: 2,
    type: 'booking',
    visitor: '鈴木 美咲',
    company: 'XYZ株式会社',
    time: '08:15',
    description: '来訪予約が作成されました',
  },
  {
    id: 3,
    type: 'notification',
    visitor: '高橋 健太',
    company: 'DEF株式会社',
    time: '07:45',
    description: '担当者に通知を送信',
  },
  {
    id: 4,
    type: 'checkout',
    visitor: '伊藤 由美',
    company: 'GHI株式会社',
    time: '昨日 16:30',
    description: 'チェックアウト完了',
  },
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'checkin':
      return <Check className="w-4 h-4 text-green-600" />;
    case 'booking':
      return <Plus className="w-4 h-4 text-blue-600" />;
    case 'notification':
      return <TrendingUp className="w-4 h-4 text-amber-600" />;
    case 'checkout':
      return <CheckCircle2 className="w-4 h-4 text-gray-600" />;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(
    null
  );

  const handleQuickAction = (action: string) => {
    setQuickActionLoading(action);
    setTimeout(() => setQuickActionLoading(null), 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => {
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
          <button
            onClick={() => handleQuickAction('new-appointment')}
            disabled={quickActionLoading === 'new-appointment'}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Plus size={20} />
            新規来訪予約
          </button>
          <button
            onClick={() => handleQuickAction('add-employee')}
            disabled={quickActionLoading === 'add-employee'}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Plus size={20} />
            社員追加
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Visitors */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                次の来訪予定 (5件)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      時刻
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
                      会議室
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockUpcomingVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {visitor.checkInTime}
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
                        {visitor.room}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">最近のアクティビティ</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockActivityFeed.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.visitor}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.company}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-700">
              もっと見る
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
