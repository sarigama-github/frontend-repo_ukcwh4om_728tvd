import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, CheckCircle2, Clock4, UploadCloud, UserPlus2, Download, FileCheck2, StickyNote } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function StageHeader({ title, description, checked, children }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-5 h-5 ${checked ? 'text-emerald-600' : 'text-slate-300'}`} />
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function ItemRow({ stage, item, mode, onUpload, onAssign, onAction, logs }) {
  const [open, setOpen] = useState(true)
  const [assignee, setAssignee] = useState('Reviewer A')

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          <span className="font-medium text-slate-800">{item.title}</span>
          {item.optional && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Optional</span>}
        </div>
        <div className="text-xs text-slate-500">Sub‑logs & actions</div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-2">
            {mode === 'user' && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" className="hidden" onChange={e => e.target.files[0] && onUpload(stage.key, item.key, e.target.files[0])} />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white hover:opacity-90 transition">
                  <UploadCloud className="w-4 h-4" /> Upload
                </span>
              </label>
            )}
            {mode === 'admin' && (
              <>
                <div className="flex items-center gap-2">
                  <input value={assignee} onChange={e=>setAssignee(e.target.value)} className="px-2 py-1.5 text-sm border rounded-md" />
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={()=>onAssign(stage.key, item.key, assignee)}>
                    <UserPlus2 className="w-4 h-4" /> Assign
                  </button>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-slate-700 text-white hover:bg-slate-800" onClick={()=>onAction(stage.key, item.key, 'download')}>
                  <Download className="w-4 h-4" /> Mark Downloaded
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>onAction(stage.key, item.key, 'review')}>
                  <FileCheck2 className="w-4 h-4" /> Mark Reviewed
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={()=>onAction(stage.key, item.key, 'decision')}>
                  <CheckCircle2 className="w-4 h-4" /> Decision
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={()=>onAction(stage.key, item.key, 'note')}>
                  <StickyNote className="w-4 h-4" /> Add Note
                </button>
              </>
            )}
          </div>

          {/* Logs */}
          <div className="border rounded-md divide-y">
            {logs.length === 0 && (
              <div className="p-3 text-sm text-slate-500">No activity yet. Actions here will appear in a sub‑topic timeline.</div>
            )}
            {logs.map(l => (
              <div key={l.id} className="p-3 text-sm flex items-start justify-between">
                <div>
                  <div className="font-medium text-slate-800">{l.type}</div>
                  <div className="text-slate-600">{l.message}</div>
                </div>
                <div className="text-xs text-slate-500">{new Date(l.created_at || l.updated_at || Date.now()).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StageBoard({ mode }) {
  const [process, setProcess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState({})

  const fetchProcess = async () => {
    setLoading(true)
    await fetch(`${API}/api/seed`).catch(()=>{})
    const res = await fetch(`${API}/api/process`)
    const data = await res.json()
    setProcess(data)
    setLoading(false)
  }

  const fetchLogs = async () => {
    const res = await fetch(`${API}/api/logs`)
    const data = await res.json()
    const group = {}
    data.logs.forEach(l => {
      const key = `${l.stage_key}:${l.item_key}`
      group[key] = group[key] || []
      group[key].push(l)
    })
    setLogs(group)
  }

  useEffect(() => {
    fetchProcess()
  }, [])

  useEffect(() => {
    fetchLogs()
    const t = setInterval(fetchLogs, 1500)
    return () => clearInterval(t)
  }, [])

  const onUpload = async (stageKey, itemKey, file) => {
    const fd = new FormData()
    fd.append('item_key', itemKey)
    fd.append('stage_key', stageKey)
    fd.append('file', file)
    fd.append('actor', 'requester')
    await fetch(`${API}/api/upload`, { method: 'POST', body: fd })
    fetchLogs()
  }

  const onAssign = async (stageKey, itemKey, assignee) => {
    await fetch(`${API}/api/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage_key: stageKey, item_key: itemKey, assignee, actor: 'admin' }) })
    fetchLogs()
  }

  const onAction = async (stageKey, itemKey, action) => {
    await fetch(`${API}/api/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage_key: stageKey, item_key: itemKey, action, actor: mode === 'admin' ? 'admin' : 'assignee', note: action==='note' ? 'Added a note' : undefined }) })
    fetchLogs()
  }

  if (loading || !process) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border shadow-sm">
          <Clock4 className="w-4 h-4 text-amber-500" />
          <span className="text-slate-700">Loading process...</span>
        </div>
      </div>
    )
  }

  return (
    <section className="py-10 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 space-y-8">
        {process.stages.map((stage, idx) => {
          const checked = Object.keys(logs).some(k => k.startsWith(stage.key+':'))
          return (
            <div key={stage.key} className="space-y-3">
              <StageHeader title={`Stage ${idx+1}: ${stage.title}`} description={stage.description} checked={checked}>
              </StageHeader>
              <div className="grid md:grid-cols-2 gap-4">
                {stage.items.map((item) => {
                  const l = logs[`${stage.key}:${item.key}`] || []
                  return (
                    <ItemRow key={item.key} stage={stage} item={item} mode={mode} logs={l} onUpload={onUpload} onAssign={onAssign} onAction={onAction} />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
