'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', department: '', position: '',
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (e) {
      console.error('Failed to fetch employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleOpenModal = (employee?: Employee) => {
    setError('');
    if (employee) {
      setEditingId(employee.id);
      setFormData({ name: employee.name, email: employee.email, department: employee.department, position: employee.position || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', department: '', position: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/admin/employees/${editingId}` : '/api/admin/employees';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!data.success) { setError(data.error || '保存に失敗しました'); return; }
      handleCloseModal();
      fetchEmployees();
    } catch { setError('通信エラーが発生しました'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`${name} を削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchEmployees();
    } catch (e) { console.error('Delete failed:', e); }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !employee.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchEmployees();
    } catch (e) { console.error('Toggle failed:', e); }
  };

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];
  const filtered = employees.filter((e) => {
    if (filterDept !== 'all' && e.department !== filterDept) return false;
    if (searchQuery && !e.name.includes(searchQuery) && !e.email.includes(searchQuery)) return false;
    return true;
  });
  const activeCount = employees.filter((e) => e.isActive).length;

  // Department color mapping
  const deptColors: Record<string, { bg: string; color: string }> = {
    '役員': { bg: '#fef3c7', color: '#92400e' },
    '総務': { bg: '#dbeafe', color: '#1e40af' },
    '開発': { bg: '#d1fae5', color: '#065f46' },
    '不用品': { bg: '#fce7f3', color: '#9d174d' },
    '外壁': { bg: '#e0e7ff', color: '#3730a3' },
    'おそうじ': { bg: '#ccfbf1', color: '#115e59' },
    '人事': { bg: '#fef9c3', color: '#854d0e' },
    'マーケティング': { bg: '#ede9fe', color: '#5b21b6' },
    'ブランド': { bg: '#ffe4e6', color: '#9f1239' },
    'オヨビー': { bg: '#f0fdf4', color: '#166534' },
  };

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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            社員管理
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {employees.length}名登録 · {activeCount}名が活動中
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}
        >
          ＋ 社員追加
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 名前・メールで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: 'white',
              fontSize: '13px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          style={{
            padding: '10px 16px', borderRadius: '10px',
            border: '1px solid #e2e8f0', background: 'white',
            fontSize: '13px', color: '#334155', outline: 'none',
            cursor: 'pointer', minWidth: '140px',
          }}
        >
          <option value="all">全部署</option>
          {departments.sort().map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Department summary chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {departments.sort().map((dept) => {
          const count = employees.filter((e) => e.department === dept).length;
          const dc = deptColors[dept] || { bg: '#f1f5f9', color: '#475569' };
          return (
            <button
              key={dept}
              onClick={() => setFilterDept(filterDept === dept ? 'all' : dept)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none',
                background: filterDept === dept ? dc.color : dc.bg,
                color: filterDept === dept ? 'white' : dc.color,
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {dept} ({count})
            </button>
          );
        })}
      </div>

      {/* Employee Table */}
      <div style={{
        background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['名前', 'メール', '部署', '役職', 'ステータス', 'アクション'].map((h) => (
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
              {filtered.length > 0 ? filtered.map((emp) => {
                const dc = deptColors[emp.department] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc', opacity: emp.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '10px',
                          background: dc.bg, color: dc.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: '700', flexShrink: 0,
                        }}>
                          {emp.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                      {emp.email}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '600',
                        background: dc.bg, color: dc.color,
                      }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#64748b' }}>
                      {emp.position || '—'}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', border: 'none',
                          background: emp.isActive ? '#d1fae5' : '#f1f5f9',
                          color: emp.isActive ? '#065f46' : '#94a3b8',
                          fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        {emp.isActive ? '● 活動中' : '○ 非活動'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenModal(emp)}
                          style={{
                            padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: 'white', color: '#3b82f6', fontSize: '12px', fontWeight: '500',
                            cursor: 'pointer',
                          }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          style={{
                            padding: '5px 10px', borderRadius: '8px', border: '1px solid #fecaca',
                            background: 'white', color: '#ef4444', fontSize: '12px', fontWeight: '500',
                            cursor: 'pointer',
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: 0 }}>該当する社員が見つかりません</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '16px', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', maxWidth: '480px',
            width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingId ? '社員情報を編集' : '新規社員を追加'}
              </h2>
              <button onClick={handleCloseModal} style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: '#f1f5f9', color: '#64748b', fontSize: '18px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                  background: '#fef2f2', color: '#dc2626', fontSize: '13px', fontWeight: '500',
                  border: '1px solid #fecaca',
                }}>
                  {error}
                </div>
              )}

              {[
                { label: '名前', key: 'name', type: 'text', required: true, placeholder: '例: 山田 太郎' },
                { label: 'メール', key: 'email', type: 'email', required: true, placeholder: '例: yamada@madoguchi.inc' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>部署</label>
                  <input
                    type="text" list="departments-modal"
                    placeholder="例: 開発"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <datalist id="departments-modal">
                    {departments.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>役職</label>
                  <input
                    type="text"
                    placeholder="例: マネージャー"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0',
                  background: 'white', color: '#64748b', fontSize: '14px', fontWeight: '500',
                  cursor: 'pointer',
                }}>
                  キャンセル
                </button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: saving ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white', fontSize: '14px', fontWeight: '600',
                  cursor: saving ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}>
                  {saving ? '保存中...' : editingId ? '更新する' : '追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
