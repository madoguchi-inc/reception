'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';

// Mock data
const mockAppointments = [
  {
    id: 1,
    visitorName: '山田 太郎',
    company: 'ABC株式会社',
    email: 'yamada@abc.com',
    phone: '090-1234-5678',
    dateTime: '2026-02-27 09:30',
    host: '佐藤 花子',
    room: '会議室A',
    purpose: '営業打ち合わせ',
    status: 'confirmed',
    notes: '初回訪問',
  },
  {
    id: 2,
    visitorName: '鈴木 美咲',
    company: 'XYZ株式会社',
    email: 'suzuki@xyz.com',
    phone: '090-9876-5432',
    dateTime: '2026-02-27 10:00',
    host: '渡辺 次郎',
    room: '会議室B',
    purpose: '契約更新',
    status: 'confirmed',
    notes: '',
  },
  {
    id: 3,
    visitorName: '高橋 健太',
    company: 'DEF株式会社',
    email: 'takahashi@def.com',
    phone: '090-5555-6666',
    dateTime: '2026-02-27 11:00',
    host: '佐藤 花子',
    room: '会議室A',
    purpose: '技術相談',
    status: 'confirmed',
    notes: '',
  },
  {
    id: 4,
    visitorName: '伊藤 由美',
    company: 'GHI株式会社',
    email: 'itou@ghi.com',
    phone: '090-7777-8888',
    dateTime: '2026-02-26 14:00',
    host: '田中 次郎',
    room: '会議室C',
    purpose: '提案説明',
    status: 'completed',
    notes: 'スムーズに完了',
  },
  {
    id: 5,
    visitorName: '佐々木 拓也',
    company: 'JKL株式会社',
    email: 'sasaki@jkl.com',
    phone: '090-9999-0000',
    dateTime: '2026-02-25 10:30',
    host: '渡辺 次郎',
    room: '会議室B',
    purpose: '打ち合わせ',
    status: 'cancelled',
    notes: 'クライアント都合によるキャンセル',
  },
];

const mockHosts = [
  '佐藤 花子',
  '渡辺 次郎',
  '田中 次郎',
  '鈴木 太郎',
  '高橋 美咲',
];

const mockRooms = [
  '会議室A',
  '会議室B',
  '会議室C',
  '会議室D',
];

const purposes = [
  '営業打ち合わせ',
  '契約更新',
  '技術相談',
  '提案説明',
  '打ち合わせ',
  'その他',
];

type Status = 'confirmed' | 'checkin' | 'completed' | 'cancelled';

function getStatusBadge(status: Status) {
  switch (status) {
    case 'confirmed':
      return (
        <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          予約済み
        </span>
      );
    case 'checkin':
      return (
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          チェックイン
        </span>
      );
    case 'completed':
      return (
        <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
          完了
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          キャンセル
        </span>
      );
    default:
      return null;
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    visitorName: '',
    company: '',
    email: '',
    phone: '',
    dateTime: '',
    host: '',
    room: '',
    purpose: '',
    notes: '',
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.visitorName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (appointment?: (typeof mockAppointments)[0]) => {
    if (appointment) {
      setEditingId(appointment.id);
      setFormData({
        visitorName: appointment.visitorName,
        company: appointment.company,
        email: appointment.email,
        phone: appointment.phone,
        dateTime: appointment.dateTime,
        host: appointment.host,
        room: appointment.room,
        purpose: appointment.purpose,
        notes: appointment.notes,
      });
    } else {
      setEditingId(null);
      setFormData({
        visitorName: '',
        company: '',
        email: '',
        phone: '',
        dateTime: '',
        host: '',
        room: '',
        purpose: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingId
            ? { ...apt, ...formData, status: apt.status }
            : apt
        )
      );
    } else {
      setAppointments([
        ...appointments,
        { id: Math.max(...appointments.map((a) => a.id), 0) + 1, ...formData, status: 'confirmed' as Status },
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('この予約を削除してもよろしいですか？')) {
      setAppointments(appointments.filter((apt) => apt.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">来訪予約</h1>
          <p className="mt-1 text-gray-600">
            合計 {filteredAppointments.length} 件の予約
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={20} />
          新規予約
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
              placeholder="来訪者名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">全てのステータス</option>
              <option value="confirmed">予約済み</option>
              <option value="checkin">チェックイン</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
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
                  会議室
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {appointment.dateTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {appointment.visitorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.host}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {appointment.room}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(appointment.status as Status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenModal(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    予約が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '予約を編集' : '新規予約を作成'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    来訪者名
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visitorName}
                    onChange={(e) =>
                      setFormData({ ...formData, visitorName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メール
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    訪問日時
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目的
                  </label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {purposes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当者
                  </label>
                  <select
                    required
                    value={formData.host}
                    onChange={(e) =>
                      setFormData({ ...formData, host: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {mockHosts.map((host) => (
                      <option key={host} value={host}>
                        {host}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会議室
                  </label>
                  <select
                    required
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {mockRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingId ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
