'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  ChevronDown,
  ToggleLeft,
} from 'lucide-react';

// Mock data
const mockEmployees = [
  {
    id: 1,
    name: '佐藤 花子',
    email: 'satou.hanako@company.com',
    phone: '090-1111-1111',
    department: '営業部',
    position: 'マネージャー',
    googleChatSpaceId: 'spaces/ABC123',
    status: 'active',
  },
  {
    id: 2,
    name: '渡辺 次郎',
    email: 'watanabe.jiro@company.com',
    phone: '090-2222-2222',
    department: '営業部',
    position: '営業',
    googleChatSpaceId: 'spaces/DEF456',
    status: 'active',
  },
  {
    id: 3,
    name: '田中 次郎',
    email: 'tanaka.jiro@company.com',
    phone: '090-3333-3333',
    department: '企画部',
    position: '部長',
    googleChatSpaceId: 'spaces/GHI789',
    status: 'active',
  },
  {
    id: 4,
    name: '鈴木 太郎',
    email: 'suzuki.taro@company.com',
    phone: '090-4444-4444',
    department: '営業部',
    position: '営業',
    googleChatSpaceId: 'spaces/JKL012',
    status: 'inactive',
  },
  {
    id: 5,
    name: '高橋 美咲',
    email: 'takahashi.misaki@company.com',
    phone: '090-5555-5555',
    department: '企画部',
    position: 'デザイナー',
    googleChatSpaceId: 'spaces/MNO345',
    status: 'active',
  },
];

const mockDepartments = ['営業部', '企画部', 'IT部', '総務部', '経営企画部'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [departments, setDepartments] = useState(mockDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDepartment, setNewDepartment] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    googleChatSpaceId: '',
  });

  const handleOpenModal = (employee?: (typeof mockEmployees)[0]) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        googleChatSpaceId: employee.googleChatSpaceId,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        googleChatSpaceId: '',
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
      setEmployees(
        employees.map((emp) =>
          emp.id === editingId
            ? {
                ...emp,
                ...formData,
                status: emp.status,
              }
            : emp
        )
      );
    } else {
      setEmployees([
        ...employees,
        {
          id: Math.max(...employees.map((e) => e.id), 0) + 1,
          ...formData,
          status: 'active',
        },
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('この社員を削除してもよろしいですか？')) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              status: emp.status === 'active' ? 'inactive' : 'active',
            }
          : emp
      )
    );
  };

  const handleAddDepartment = () => {
    if (newDepartment && !departments.includes(newDepartment)) {
      setDepartments([...departments, newDepartment]);
      setNewDepartment('');
    }
  };

  const handleDeleteDepartment = (dept: string) => {
    if (window.confirm(`${dept} を削除してもよろしいですか？`)) {
      setDepartments(departments.filter((d) => d !== dept));
    }
  };

  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">社員管理</h1>
          <p className="mt-1 text-gray-600">
            {employees.length} 名 ({activeEmployees} 名が活動中)
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <Upload size={20} />
            CSV インポート
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            社員追加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      メール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      部署
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      役職
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
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            employee.status === 'active'
                              ? 'text-green-700 bg-green-100'
                              : 'text-gray-700 bg-gray-100'
                          }`}
                        >
                          {employee.status === 'active' ? '活動中' : '非活動'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleToggleStatus(employee.id)
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ToggleLeft size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Management */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">部署管理</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新規部署を追加
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="部署名"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleAddDepartment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  部署一覧
                </label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {dept}
                      </span>
                      <button
                        onClick={() => handleDeleteDepartment(dept)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '社員情報を編集' : '新規社員を追加'}
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
                    名前
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Chat Space ID
                  </label>
                  <input
                    type="text"
                    value={formData.googleChatSpaceId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        googleChatSpaceId: e.target.value,
                      })
                    }
                    placeholder="spaces/ABC123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
