'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: string
  name: string
  department: string
}

const PURPOSES = [
  { id: 'meeting', label: '打ち合わせ' },
  { id: 'interview', label: '面接' },
  { id: 'delivery', label: '配達' },
  { id: 'other', label: 'その他' },
]

const CARRIERS = [
  { id: 'yamato', label: 'ヤマト運輸' },
  { id: 'sagawa', label: '佐川急便' },
  { id: 'japanpost', label: '日本郵便' },
  { id: 'other_delivery', label: 'その他' },
]

type StepType = 1 | 2 | 3 | 4 | 'delivery_complete'

// Glassmorphism card style
const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.18)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  fontSize: '16px',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '14px',
  outline: 'none',
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

export default function CheckInPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [purpose, setPurpose] = useState<string | null>(null)
  const [visitorName, setVisitorName] = useState('')
  const [visitorCompany, setVisitorCompany] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryDone, setDeliveryDone] = useState(false)

  const isDeliveryFlow = purpose === 'delivery'

  useEffect(() => {
    fetch('/api/reception/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.employees) setEmployees(data.employees)
      })
      .catch(err => console.error('Failed to fetch employees:', err))
  }, [])

  useEffect(() => {
    if (deliveryDone) {
      const timer = setTimeout(() => router.push('/reception'), 5000)
      return () => clearTimeout(timer)
    }
  }, [deliveryDone, router])

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)))
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = !selectedDepartment || emp.department === selectedDepartment
    return matchesSearch && matchesDept
  })

  // 用件選択時に自動的に次のステップへ
  const selectPurpose = (id: string) => {
    setPurpose(id)
    setError(null)
    setCurrentStep(2)
  }

  const handleNext = () => {
    setError(null)
    if (currentStep === 1) {
      if (!purpose) { setError('用件を選択してください'); return }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (isDeliveryFlow) {
        if (!selectedCarrier) { setError('配送業者を選択してください'); return }
        handleDeliverySubmit()
      } else {
        if (!visitorName.trim()) { setError('お名前を入力してください'); return }
        setCurrentStep(3)
      }
    } else if (currentStep === 3) {
      if (!selectedEmployee) { setError('担当者を選択してください'); return }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep === 1) router.push('/reception')
    else if (currentStep === 2) setCurrentStep(1)
    else if (currentStep === 3) setCurrentStep(2)
    else if (currentStep === 4) setCurrentStep(3)
  }

  const handleDeliverySubmit = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/reception/delivery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: selectedCarrier }),
      })
      const data = await res.json()
      if (data.success) setDeliveryDone(true)
      else setError(data.error || '受付に失敗しました')
    } catch { setError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/reception/checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName, visitorCompany, purpose, employeeId: selectedEmployee?.id }),
      })
      const data = await res.json()
      if (data.success) router.push(`/reception/waiting/${data.appointmentId}`)
      else setError(data.error || '受付に失敗しました')
    } catch { setError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  const getPurposeLabel = (id: string | null) => PURPOSES.find(p => p.id === id)?.label || ''
  const getStepCount = () => isDeliveryFlow ? 2 : 4
  const getDisplayStep = () => {
    if (currentStep === 'delivery_complete') return 2
    return typeof currentStep === 'number' ? currentStep : 1
  }

  // Delivery complete screen
  if (deliveryDone) {
    const carrierLabel = CARRIERS.find(c => c.id === selectedCarrier)?.label || ''
    return (
      <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
        <div style={glassCard}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#4ade80', margin: '0 0 8px' }}>
              受付完了
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: '0 0 32px' }}>
              配達受け付けが完了しました
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>配送業者</span>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>{carrierLabel}</span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              5秒後に自動的にトップページに戻ります...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={handleBack}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '500',
          marginBottom: '24px', padding: '4px 0',
          opacity: loading ? 0.5 : 1,
        }}
      >
        ← 戻る
      </button>

      {/* Step indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: '8px', marginBottom: '24px',
      }}>
        {Array.from({ length: getStepCount() }).map((_, index) => {
          const step = index + 1
          const displayStep = getDisplayStep()
          const isActive = step === displayStep
          const isDone = step < displayStep
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '15px',
                background: isActive ? 'white' : isDone ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#0f172a' : isDone ? '#4ade80' : 'rgba(255,255,255,0.3)',
                border: isActive ? 'none' : isDone ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isActive ? '0 4px 16px rgba(255,255,255,0.3)' : 'none',
              }}>
                {isDone ? '✓' : step}
              </div>
              {step < getStepCount() && (
                <div style={{
                  width: '32px', height: '2px',
                  background: isDone ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)',
                  borderRadius: '1px',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Main card */}
      <div style={glassCard}>
        {/* Step 1: Purpose */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>用件</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', fontSize: '15px' }}>
              来訪の目的を選択してください
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {PURPOSES.map(p => (
                <button key={p.id} onClick={() => selectPurpose(p.id)} style={{
                  padding: '24px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                  background: 'rgba(255,255,255,0.08)',
                  outline: '1px solid rgba(255,255,255,0.12)',
                }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>{p.label}</p>
                </button>
              ))}
            </div>
            {error && <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          </div>
        )}

        {/* Step 2: Delivery Carrier */}
        {currentStep === 2 && isDeliveryFlow && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>配送業者</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', fontSize: '15px' }}>
              配送業者を選択してください
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {CARRIERS.map(c => (
                <button key={c.id} onClick={() => setSelectedCarrier(c.id)} style={{
                  padding: '24px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                  background: selectedCarrier === c.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  outline: selectedCarrier === c.id ? '2px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.12)',
                }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>{c.label}</p>
                </button>
              ))}
            </div>
            {error && <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          </div>
        )}

        {/* Step 2: Visitor Info */}
        {currentStep === 2 && !isDeliveryFlow && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>基本情報</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', fontSize: '15px' }}>
              {purpose === 'meeting' ? '来訪者情報を入力してください' : 'お名前を入力してください'}
            </p>
            <div style={{ marginBottom: purpose === 'meeting' ? '20px' : '8px' }}>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                お名前 <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text" value={visitorName}
                onChange={e => setVisitorName(e.target.value)}
                placeholder="山田 太郎"
                style={inputStyle}
              />
            </div>
            {purpose === 'meeting' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                  会社名 <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>(任意)</span>
                </label>
                <input
                  type="text" value={visitorCompany}
                  onChange={e => setVisitorCompany(e.target.value)}
                  placeholder="株式会社 〇〇〇"
                  style={inputStyle}
                />
              </div>
            )}
            {error && <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          </div>
        )}

        {/* Step 3: Employee Selection */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>担当者を選択</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', fontSize: '15px' }}>
              対応される担当者を選択してください
            </p>
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 名前で検索..."
                style={inputStyle}
              />
            </div>
            {/* Department chips */}
            {departments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setSelectedDepartment(null)} style={{
                  padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                  background: !selectedDepartment ? 'white' : 'rgba(255,255,255,0.1)',
                  color: !selectedDepartment ? '#0f172a' : 'rgba(255,255,255,0.7)',
                }}>全員</button>
                {departments.map(dept => (
                  <button key={dept} onClick={() => setSelectedDepartment(dept)} style={{
                    padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                    background: selectedDepartment === dept ? 'white' : 'rgba(255,255,255,0.1)',
                    color: selectedDepartment === dept ? '#0f172a' : 'rgba(255,255,255,0.7)',
                  }}>{dept}</button>
                ))}
              </div>
            )}
            {/* Employee grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
              maxHeight: '200px', overflowY: 'auto',
              paddingRight: '4px',
            }}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <button key={emp.id} onClick={() => setSelectedEmployee(emp)} style={{
                    padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s',
                    background: selectedEmployee?.id === emp.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
                    outline: selectedEmployee?.id === emp.id ? '2px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0,
                    }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', color: 'white', margin: 0, fontSize: '14px' }}>{emp.name}</p>
                      {emp.department && (
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '2px 0 0' }}>{emp.department}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.4)' }}>
                  該当する担当者が見つかりません
                </div>
              )}
            </div>
            {error && <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>確認</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', fontSize: '15px' }}>
              入力内容をご確認ください
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '8px 24px',
            }}>
              {[
                { label: 'お名前', value: `${visitorName}様` },
                ...(purpose === 'meeting' && visitorCompany ? [{ label: '会社名', value: visitorCompany }] : []),
                { label: '用件', value: getPurposeLabel(purpose) },
                { label: '担当者', value: selectedEmployee?.name || '' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
                  <span style={{ color: 'white', fontSize: '17px', fontWeight: '700' }}>{item.value}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          </div>
        )}

        {/* Navigation buttons (Step 1は自動遷移のため非表示) */}
        {currentStep !== 1 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button onClick={handleBack} disabled={loading} style={{
              flex: 1, padding: '16px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)', fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}>
              戻る
            </button>
            <button onClick={handleNext} disabled={loading} style={{
              flex: 1, padding: '16px', borderRadius: '14px',
              border: 'none', background: 'white', color: '#0f172a',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              {loading ? '処理中...' : currentStep === 4 ? '受付完了' : '次へ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
