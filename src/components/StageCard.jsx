import { motion } from 'framer-motion'
import { CheckCircle2, Clock3, FileUp, FileText, UserCheck, Download, Eye, Check, MessageSquareText } from 'lucide-react'

function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>
}

function UploadRow({ label, onUpload, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <span className="text-xs text-slate-600">Upload</span>
        <FileUp className="w-4 h-4 text-slate-500" />
      </label>
    </div>
  )
}

function TimelineItem({ icon: Icon, title, subtitle, time }) {
  return (
    <div className="relative pl-8 pb-4">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white border border-slate-200 grid place-items-center">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
      </div>
      <div className="text-sm text-slate-800">{title}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      {time && <div className="text-[10px] text-slate-400 mt-0.5">{time}</div>}
    </div>
  )
}

function StageCard({ stage, role, logs, onUpload, onAssign, onAction, done }) {
  const progress = Math.min(100, Math.round((logs.filter(l => l.type === 'upload').length / stage.items.length) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900">{stage.title}</h3>
          <p className="text-sm text-slate-500">{stage.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={done ? 'emerald' : 'amber'}>
            {done ? 'Completed' : 'In progress'}
          </Badge>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 p-5">
        {stage.items.map((it) => (
          <UploadRow key={it.key} label={`${it.title}${it.optional ? ' (optional)' : ''}`} onUpload={(file) => onUpload(stage.key, it.key, file)} disabled={role !== 'user'} />
        ))}
      </div>

      <div className="px-5 pb-5">
        <div className="text-xs font-medium text-slate-500 mb-2">Activity</div>
        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
          {logs.length === 0 && (
            <div className="p-4 text-sm text-slate-500">No activity yet.</div>
          )}
          {logs.map((l) => (
            <div key={l.id} className="p-4">
              <TimelineItem
                icon={l.type === 'upload' ? FileUp : l.type === 'assignment' ? UserCheck : l.type === 'download' ? Download : l.type === 'review' ? Eye : l.type === 'decision' ? Check : MessageSquareText}
                title={l.message}
                subtitle={`${l.item_key} • ${l.actor}`}
                time={new Date(l.created_at || Date.now()).toLocaleString()}
              />
            </div>
          ))}
        </div>
      </div>

      {role === 'admin' && (
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2">
          <button onClick={() => onAssign(stage.key)} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition">
            <UserCheck className="w-4 h-4" /> Assign Reviewer
          </button>
          <button onClick={() => onAction(stage.key, 'download')} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition">
            <Download className="w-4 h-4" /> Mark Download
          </button>
          <button onClick={() => onAction(stage.key, 'review')} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            <Eye className="w-4 h-4" /> Mark Review
          </button>
          <button onClick={() => onAction(stage.key, 'decision')} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
            <Check className="w-4 h-4" /> Record Decision
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default StageCard
