'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Search, User, CheckCircle2 } from 'lucide-react'

interface CheckInState {
  step: 1 | 2 | 3 | 4
  visitorName: string
  visitorCompany: string
  purpose: string | null
  selectedEmployeeId: string | null
  selectedEmployeeName: string | null
  searchQuery: string
  selectedDepartment: string | null
  selectedCarrier: string | null
}

interface Employee {
  id: string
  name: string
  department: string
  avatar?: string
}

interface Carrier {
  id: string
  label: string
  icon: string
}

const PURPOSES = [
  { id: 'meeting', label: '打ち合わせ', icon: '📋' },
  { id: 'interview', label: '面接', icon: '👔' },
  { id: 'delivery', label: '配達', icon: '📦' },
  { id: 'other', label: 'その他', icon: '❓' },
]

const CARRIERS: Carrier[] = [
  { id: 'yamato', label: 'ヤマト運輸', icon: '🐈‍⬛' },
  { id: 'sagawa', label: '佐川急便', icon: '🚛' },
  { id: 'japanpost', label: '日本郵便', icon: '📮' },
  { id: 'other_delivery', label: 'その他', icon: '📋' },
]

// Mock employee data - in production, fetch from API
const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: '田中 太郎', department: '営業' },
  { id: '2', name: '佐藤 花子', department: '営業' },
  { id: '3', name: '鈴木 次郎', department: '企画' },
  { id: '4', name: '高橋 美咲', department: '企画' },
  { id: '5', name: '伊藤 健太', department: 'エンジニア' },
  { id: '6', name: '山田 由美', department: 'エンジニア' },
  { id: '7', name: '中村 一郎', department: '事務' },
  { id: '8', name: '松本 里奈', department: '事務' },
]

type StepType = 1 | 2 | 3 | 4 | 'delivery_complete'

export default function CheckInPage() {
  const router = useRouter()
  const [state, setState] = useState<CheckInState>({
    step: 1,
    visitorName: '',
    visitorCompany: '',
    purpose: null,
    selectedEmployeeId: null,
    selectedEmployeeName: null,
    searchQuery: '',
    selectedDepartment: null,
    selectedCarrier: null,
  })
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryCarrierName, setDeliveryCarrierName] = useState<string | null>(null)

  const isDeliveryFlow = state.purpose === 'delivery'

  useEffect(() => {
    if (deliveryCarrierName) {
      const timer = setTimeout(() => {
        router.push('/reception')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [deliveryCarrierName, router])

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    const matchesDept = !state.selectedDepartment || emp.department === state.selectedDepartment
    return matchesSearch && matchesDept
  })

  const departments = Array.from(new Set(MOCK_EMPLOYEES.map(emp => emp.department)))

  const handleNext = () => {
    setError(null)

    if (currentStep === 1) {
      if (!state.purpose) {
        setError('用件を選択してください')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (isDeliveryFlow) {
        if (!state.selectedCarrier) {
          setError('配送業者を選択してください')
          return
        }
        handleDeliverySubmit()
      } else {
        if (!state.visitorName.trim()) {
          setError('お名前を入力してください')
          return
        }
        setCurrentStep(3)
      }
    } else if (currentStep === 3) {
      if (!state.selectedEmployeeId) {
        setError('担当者を選択してください')
        return
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep === 1) {
      router.push('/reception')
    } else if (currentStep === 2) {
      if (isDeliveryFlow) {
        setCurrentStep(1)
      } else {
        setCurrentStep(1)
      }
    } else if (currentStep === 3) {
      setCurrentStep(2)
    } else if (currentStep === 4) {
      setCurrentStep(3)
    }
  }

  const handleDeliverySubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const carrierLabel = CARRIERS.find(c => c.id === state.selectedCarrier)?.label || ''
      const res = await fetch('/api/reception/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: state.selectedCarrier,
          department: '総務部',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setDeliveryCarrierName(carrierLabel)
      } else {
        setError(data.error || '受付に失敗しました')
      }
    } catch (err) {
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
          visitorName: state.visitorName,
          visitorCompany: state.visitorCompany,
          purpose: state.purpose,
          employeeId: state.selectedEmployeeId || 'demo-employee',
          organizationId: 'demo-org',
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/reception/waiting/${data.appointmentId}`)
      } else {
        setError(data.error || '受付に失敗しました')
      }
    } catch (err) {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getPurposeLabel = (purposeId: string | null) => {
    return PURPOSES.find(p => p.id === purposeId)?.label || ''
  }

  const getCarrierLabel = (carrierId: string | null) => {
    return CARRIERS.find(c => c.id === carrierId)?.label || ''
  }

  const getStepCount = () => {
    return isDeliveryFlow ? 2 : 4
  }

  const getDisplayStep = () => {
    if (currentStep === 'delivery_complete') return 2
    if (isDeliveryFlow) {
      if (currentStep === 1) return 1
      if (currentStep === 2) return 2
    }
    return currentStep
  }

  // Delivery completion screen
  if (deliveryCarrierName) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100">
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-green-600 mb-2">受付完了</h2>
              <p className="text-slate-600 text-lg">配達受け付けが完了しました</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">配送業者</span>
                <span className="text-lg font-bold text-slate-800">{deliveryCarrierName}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">受付部署</span>
                <span className="text-lg font-bold text-slate-800">総務部</span>
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
      {/* Back button */}
      <button
        onClick={handleBack}
        disabled={loading}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 disabled:opacity-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      {/* Step indicator */}
      <div className="flex justify-between items-center mb-8 px-4">
        {Array.from({ length: getStepCount() }).map((_, index) => {
          const step = index + 1
          const displayStep = getDisplayStep()
          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step === displayStep
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : step < displayStep
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {step < displayStep ? '✓' : step}
              </div>
              {step < getStepCount() && (
                <div
                  className={`w-12 h-1 mx-2 transition-colors ${
                    step < displayStep ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100">
        {/* Step 1: Purpose Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">用件</h2>
              <p className="text-slate-500">来訪の目的を選択してください</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PURPOSES.map(purpose => (
                <button
                  key={purpose.id}
                  onClick={() => setState(prev => ({ ...prev, purpose: purpose.id }))}
                  className={`p-6 rounded-2xl transition-all border-2 text-left ${
                    state.purpose === purpose.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{purpose.icon}</div>
                  <p className="text-lg font-bold text-slate-800">{purpose.label}</p>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Delivery Carrier Selection (Delivery Flow) */}
        {currentStep === 2 && isDeliveryFlow && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">配送業者</h2>
              <p className="text-slate-500">配送業者を選択してください</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CARRIERS.map(carrier => (
                <button
                  key={carrier.id}
                  onClick={() => setState(prev => ({ ...prev, selectedCarrier: carrier.id }))}
                  className={`p-6 rounded-2xl transition-all border-2 text-left ${
                    state.selectedCarrier === carrier.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{carrier.icon}</div>
                  <p className="text-lg font-bold text-slate-800">{carrier.label}</p>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Visitor Info (Normal Flow) */}
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
              <input
                type="text"
                value={state.visitorName}
                onChange={e => setState(prev => ({ ...prev, visitorName: e.target.value }))}
                placeholder="山田 太郎"
                className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                会社名 <span className="text-slate-400">(任意)</span>
              </label>
              <input
                type="text"
                value={state.visitorCompany}
                onChange={e => setState(prev => ({ ...prev, visitorCompany: e.target.value }))}
                placeholder="株式会社 〇〇〇"
                className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Employee Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">担当者を選択</h2>
              <p className="text-slate-500">対応される担当者を選択してください</p>
            </div>

            {/* Search and Department Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={state.searchQuery}
                  onChange={e => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="名前で検索..."
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Department tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedDepartment: null }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    state.selectedDepartment === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  全員
                </button>
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setState(prev => ({ ...prev, selectedDepartment: dept }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      state.selectedDepartment === dept
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Employee list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() =>
                      setState(prev => ({
                        ...prev,
                        selectedEmployeeId: emp.id,
                        selectedEmployeeName: emp.name,
                      }))
                    }
                    className={`p-4 rounded-2xl transition-all border-2 text-left flex items-center gap-4 ${
                      state.selectedEmployeeId === emp.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-sm text-slate-400">{emp.department}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-slate-500">
                  該当する担当者が見つかりません
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
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
                <span className="text-lg font-bold text-slate-800">{state.visitorName}様</span>
              </div>
              {state.visitorCompany && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">会社名</span>
                  <span className="text-lg font-bold text-slate-800">{state.visitorCompany}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">用件</span>
                <span className="text-lg font-bold text-slate-800">{getPurposeLabel(state.purpose)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">担当者</span>
                <span className="text-lg font-bold text-slate-800">{state.selectedEmployeeName}</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={handleBack}
            disabled={loading}
            className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            戻る
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? '処理中...' : currentStep === 4 ? '受付完了' : '次へ'}
            {!loading && typeof currentStep === 'number' && currentStep < (isDeliveryFlow ? 2 : 4) && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
