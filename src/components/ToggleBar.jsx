import { useEffect, useState } from 'react'
import { ShieldCheck, User, Activity, UploadCloud, CheckCircle2 } from 'lucide-react'

export default function ToggleBar({ mode, setMode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <Activity className="w-5 h-5" />
          <span className="font-semibold">Lifecycle Simulation</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('user')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${mode==='user' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
          >
            <User className="w-4 h-4" /> User View
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${mode==='admin' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin View
          </button>
        </div>
      </div>
    </div>
  )
}
