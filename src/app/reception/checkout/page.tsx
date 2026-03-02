'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reception/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName: name }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        setTimeout(() => router.push('/reception'), 3000)
      } else {
        setError(data.error || '該当する来訪記録が見つかりません')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">退館完了</h2>
          <p className="text-lg text-slate-500">ご来訪ありがとうございました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => router.push('/reception')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">退館手続き</h2>
          <p className="text-slate-500 mt-1">Check Out</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-3">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={!name.trim() || loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? '処理中...' : '退館する'}
          </button>
        </div>
      </div>
    </div>
  )
}
