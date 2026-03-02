'use client'
import { useRouter } from 'next/navigation'
import { UserCheck, QrCode } from 'lucide-react'

export default function ReceptionHome() {
  const router = useRouter()

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Logo area */}
      <div className="mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
          <span className="text-white text-3xl font-bold">M</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">ようこそ</h1>
        <p className="text-xl text-slate-500">Welcome to our office</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
        <button
          onClick={() => router.push('/reception/checkin')}
          className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 active:scale-[0.98] border border-slate-100"
        >
          <div className="w-20 h-20 bg-blue-50 group-hover:bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors">
            <UserCheck className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mb-1">受付</p>
          <p className="text-sm text-slate-400">Check In</p>
        </button>

        <button
          onClick={() => router.push('/reception/qr')}
          className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 active:scale-[0.98] border border-slate-100"
        >
          <div className="w-20 h-20 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors">
            <QrCode className="w-10 h-10 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mb-1">QRコードで受付</p>
          <p className="text-sm text-slate-400">QR Code Check In</p>
        </button>
      </div>
    </div>
  )
}
