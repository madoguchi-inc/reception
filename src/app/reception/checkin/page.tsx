'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Search, CheckCircle2 } from 'lucide-react'

interface Employee {
  id: string
  name: string
  department: string
}

const PURPOSES = [
  { id: 'meeting', label: '打ち合わせ', icon: '📋' },
  { id: 'interview', label: '面接', icon: '👔' },
  { id: 'delivery', label: '配達', icon: '📦' },
  { id: 'other', label: 'その他', icon: '❓' },
]

const CARRIERS = [
  { id: 'yamato', label: 'ヤマト運輸', icon: '🐈‍⬛' },
  { id: 'sagawa', label: '佐川急便', icon: '🚛' },
  { id: 'japanpost', label: '日本郵便', icon: '📮' },
  { id: 'other_delivery', label: 'その他', icon: '📋' },
]

type StepType = 1 | 2 | 3 | 4 | 'delivery_complete'

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

  // Fetch employees from API
  useEffect(() => {
    fetch('/api/reception/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.employees) {
          setEmployees(data.employees)
        }
      })
      .catch(err => console.error('Failed to fetch employees:', err))
  }, [])

  // Auto-return after delivery
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
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reception/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: selectedCarrier }),
      })
      const data = await res.json()
      if (data.success) {
        setDeliveryDone(true)
      } else {
        setError(data.error || '受付に失敗しました')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reception/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName,
          visitorCompany,
          purpose,
          employeeId: selectedEmployee?.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/reception/waiting/${data.appointmentId}`)
      } else {
        setError(data.error || '受付に失敗しました')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getPurposeLabel = (id: string | null) => PURPOSES.find(p => p.id === id)?.label || ''
  const getStepCount = () => isDeliveryFlow ? 2 : 4
  const getDisplayStep = () => {
    if (currentStep === 'delivery_complete') return 2
    return typeof currentStep === 'number' ? currentStep : 1
  }

  // Delivery completion
  if (deliveryDone) {
    const carrierLabel = CARRIERS.find(c => c.id === selectedCarrier)?.label || ''
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100">
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </div>
            <h2 className="text-4xl font-bold text-green-600 mb-2">受付完了</h2>
            <p className="text-slate-600 text-lg">配達受け付けが完了しました</p>
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">配送業者</span>
                <span className="text-lg font-bold text-slate-800">{carrierLabel}</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm">5秒後に自動的にトップページに戻ります...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button onClick={handleBack} disabled={loading}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 disabled:opacity-50">
        <ArrowLeft className="w-5 h-5" /><span>戻る</span>
      </button>

      {/* Step indicator */}
      <div className="flex justify-between items-center mb-8 px-4">
        {Array.from({ length: getStepCount() }).map((_, index) => {
          const step = index + 1
          const displayStep = getDisplayStep()
          return (
            <div key={step} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                step === displayStep ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : step < displayStep ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {step < displayStep ? '✓' : step}
              </div>
              {step < getStepCount() && (
                <div className={`w-12 h-1 mx-2 transition-colors ${step < displayStep ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100">
        {/* Step 1: Purpose */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">用件</h2>
              <p className="text-slate-500">来訪の目的を選択してください</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PURPOSES.map(p => (
                <button key={p.id} onClick={() => setPurpose(p.id)}
                  className={`p-6 rounded-2xl transition-all border-2 text-left ${
                    purpose === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}>
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <p className="text-lg font-bold text-slate-800">{p.label}</p>
                </button>
              ))}
            </div>
            {error && <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Step 2: Delivery Carrier */}
        {currentStep === 2 && isDeliveryFlow && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">配送業者</h2>
              <p className="text-slate-500">配送業者を選択してください</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CARRIERS.map(c => (
                <button key={c.id} onClick={() => setSelectedCarrier(c.id)}
                  className={`p-6 rounded-2xl transition-all border-2 text-left ${
                    selectedCarrier === c.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}>
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <p className="text-lg font-bold text-slate-800">{c.label}</p>
                </button>
              ))}
            </div>
            {error && <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Step 2: Visitor Info */}
        {currentStep === 2 && !isDeliveryFlow && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">基本情報</h2>
              <p className="text-slate-500">来訪者情報を入力してください</p>
            </div>
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={visitorName}
                onChange={e => setVisitorName(e.target.value)}
                placeholder="山田 太郎"
                className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                会社名 <span className="text-slate-400">(任意)</span>
              </label>
              <input type="text" value={visitorCompany}
                onChange={e => setVisitorCompany(e.target.value)}
                placeholder="株式会社 〇〇〇"
                className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
            {error && <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Step 3: Employee Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">担当者を選択</h2>
              <p className="text-slate-500">対応される担当者を選択してください</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="名前で検索..."
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
              </div>
              {departments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedDepartment(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !selectedDepartment ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}>全員</button>
                  {departments.map(dept => (
                    <button key={dept} onClick={() => setSelectedDepartment(dept)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDepartment === dept ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}>{dept}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <button key={emp.id} onClick={() => setSelectedEmployee(emp)}
                    className={`p-4 rounded-2xl transition-all border-2 text-left flex items-center gap-4 ${
                      selectedEmployee?.id === emp.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      {emp.department && <p className="text-sm text-slate-400">{emp.department}</p>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-slate-500">該当する担当者が見つかりません</div>
              )}
            </div>
            {error && <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">確認</h2>
              <p className="text-slate-500">入力内容をご確認ください</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">お名前</span>
                <span className="text-lg font-bold text-slate-800">{visitorName}様</span>
              </div>
              {visitorCompany && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">会社名</span>
                  <span className="text-lg font-bold text-slate-800">{visitorCompany}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">用件</span>
                <span className="text-lg font-bold text-slate-800">{getPurposeLabel(purpose)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">担当者</span>
                <span className="text-lg font-bold text-slate-800">{selectedEmployee?.name}</span>
              </div>
            </div>
            {error && <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          <button onClick={handleBack} disabled={loading}
            className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50">
            戻る
          </button>
          <button onClick={handleNext} disabled={loading}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? '処理中...' : currentStep === 4 ? '受付完了' : '次へ'}
            {!loading && typeof currentStep === 'number' && currentStep < (isDeliveryFlow ? 2 : 4) && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
