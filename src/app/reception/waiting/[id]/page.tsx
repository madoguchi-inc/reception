'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface AppointmentInfo {
  visitorName: string
  visitorCompany?: string
  employeeName: string
  meetingRoom?: string
  status: string
  response?: string
}

export default function WaitingPage() {
  const router = useRouter()
  const params = useParams()
  const [info, setInfo] = useState<AppointmentInfo | null>(null)
  const [dots, setDots] = useState(0)
  const [loading, setLoading] = useState(true)

  // Animated dots
  useEffect(() => {
    const timer = setInterval(() => setDots(d => (d + 1) % 4), 500)
    return () => clearInterval(timer)
  }, [])

  // Poll for status updates
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/reception/status/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setInfo(data.appointment)
        }
      } catch (err) {
        console.error('Failed to fetch status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  // Auto-return to home after 5 minutes of waiting
  useEffect(() => {
    const timeout = setTimeout(() => router.push('/reception'), 300000)
    return () => clearTimeout(timeout)
  }, [router])

  const responseMessage = info?.response === 'on_my_way'
    ? '担当者が向かっております'
    : info?.response === 'please_wait'
    ? '少々お待ちください'
    : null

  const isRejected = info?.response === 'rejected'

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100">
        {isRejected ? (
          <>
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">申し訳ございません</h2>
            <p className="text-lg text-slate-500 mb-8">担当者が対応できない状況です。</p>
            <button
              onClick={() => router.push('/reception')}
              className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 transition-all"
            >
              ホームに戻る
            </button>
          </>
        ) : responseMessage ? (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{responseMessage}</h2>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6 relative">
              <Clock className="w-12 h-12 text-blue-600" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-20" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              お待ちください{'.'.repeat(dots)}
            </h2>
            <p className="text-lg text-slate-500">担当者に通知しております</p>
          </>
        )}

        {info && (
          <div className="mt-8 pt-8 border-t border-slate-100 text-left space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 font-medium">お名前</span>
              <span className="font-semibold text-slate-700 text-right">
                {info.visitorName}様{info.visitorCompany && <div className="text-sm text-slate-500 mt-1">{info.visitorCompany}</div>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">担当者</span>
              <span className="font-semibold text-slate-700">{info.employeeName}</span>
            </div>
            {info.meetingRoom && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">会議室</span>
                <span className="font-semibold text-slate-700">{info.meetingRoom}</span>
              </div>
            )}
          </div>
        )}

        {!responseMessage && !isRejected && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500">
              5分以上お待ちの場合はお気軽にお声がけください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
