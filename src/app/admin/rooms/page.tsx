'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  MapPin,
  Wifi,
  Projector,
  Tv,
} from 'lucide-react';

// Mock data
const mockRooms = [
  {
    id: 1,
    name: '会議室A',
    capacity: 8,
    floor: '3階',
    facilities: ['WiFi', 'プロジェクター', 'ディスプレイ'],
    googleCalendarId: 'conference-room-a@company.com',
    status: 'available',
  },
  {
    id: 2,
    name: '会議室B',
    capacity: 6,
    floor: '3階',
    facilities: ['WiFi', 'ディスプレイ'],
    googleCalendarId: 'conference-room-b@company.com',
    status: 'available',
  },
  {
    id: 3,
    name: '会議室C',
    capacity: 4,
    floor: '2階',
    facilities: ['WiFi'],
    googleCalendarId: 'conference-room-c@company.com',
    status: 'available',
  },
  {
    id: 4,
    name: '会議室D',
    capacity: 12,
    floor: '3階',
    facilities: ['WiFi', 'プロジェクター', 'ディスプレイ', 'ビデオ会議システム'],
    googleCalendarId: 'conference-room-d@company.com',
    status: 'available',
  },
];

const allFacilities = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'projector', label: 'プロジェクター', icon: Projector },
  { id: 'display', label: 'ディスプレイ', icon: Tv },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState(mockRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    floor: '',
    facilities: [] as string[],
    googleCalendarId: '',
  });

  const handleOpenModal = (room?: (typeof mockRooms)[0]) => {
    if (room) {
      setEditingId(room.id);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        floor: room.floor,
        facilities: room.facilities,
        googleCalendarId: room.googleCalendarId,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        capacity: 0,
        floor: '',
        facilities: [],
        googleCalendarId: '',
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
      setRooms(
        rooms.map((room) =>
          room.id === editingId
            ? {
                ...room,
                ...formData,
                status: room.status,
              }
            : room
        )
      );
    } else {
      setRooms([
        ...rooms,
        {
          id: Math.max(...rooms.map((r) => r.id), 0) + 1,
          ...formData,
          status: 'available',
        },
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('この会議室を削除してもよろしいですか？')) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">会議室管理</h1>
          <p className="mt-1 text-gray-600">{rooms.length} 室を管理中</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={20} />
          会議室追加
        </button>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{room.floor}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    room.status === 'available'
                      ? 'text-green-700 bg-green-100'
                      : 'text-amber-700 bg-amber-100'
                  }`}
                >
                  {room.status === 'available' ? '利用可能' : '使用中'}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Capacity */}
              <div className="flex items-center gap-3">
                <Users size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">収容人数</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {room.capacity} 名
                  </p>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <p className="text-xs text-gray-500 mb-2">設備</p>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {facility}
                    </span>
                  ))}
                  {room.facilities.length === 0 && (
                    <p className="text-xs text-gray-500">設備情報なし</p>
                  )}
                </div>
              </div>

              {/* Google Calendar ID */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Google Calendar ID</p>
                <p className="text-xs font-mono text-gray-600 break-all">
                  {room.googleCalendarId}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleOpenModal(room)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <Edit2 size={16} />
                編集
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '会議室を編集' : '新規会議室を追加'}
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
                    会議室名
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="会議室A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    階数
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    placeholder="3階"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  収容人数
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  設備
                </label>
                <div className="space-y-3">
                  {allFacilities.map((facility) => (
                    <label
                      key={facility.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility.label)}
                        onChange={() => handleFacilityToggle(facility.label)}
                        className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {facility.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Calendar ID
                </label>
                <input
                  type="text"
                  value={formData.googleCalendarId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      googleCalendarId: e.target.value,
                    })
                  }
                  placeholder="conference-room-a@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Google Calendar のメールアドレスを入力してください
                </p>
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
