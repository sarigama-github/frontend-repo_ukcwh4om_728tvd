import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, CheckCircle2, Clock4, UploadCloud, UserPlus2, Download, FileCheck2, StickyNote, Link as LinkIcon, AlertTriangle } from 'lucide-react'

// Attempt to determine API base automatically, but allow manual override
const ENV_API = import.meta.env.VITE_BACKEND_URL

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

function useApiDiscovery() {
  const [apiBase, setApiBase] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const timeoutFetch = (url, options = {}, ms = 2500) => {
      const ctrl = new AbortController()
      const id = setTimeout(() => ctrl.abort(), ms)
      return fetch(url, { ...options, signal: ctrl.signal })
        .finally(() => clearTimeout(id))
    }

    const tryCandidates = async () => {
      setError(null)
      const stored = typeof window !== 'undefined' ? localStorage.getItem('apiBase') : null
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const byPort = origin.replace('3000', '8000')

      const candidates = [
        ENV_API,
        stored,
        byPort,
      ].filter(Boolean)

      for (const base of candidates) {
        try {
          const res = await timeoutFetch(`${base}/test`, {}, 2000)
          if (res.ok) {
            const data = await res.json().catch(()=>({}))
            if (!cancelled && data.backend) {
              setApiBase(base)
              localStorage.setItem('apiBase', base)
              return
            }
          }
        } catch (e) {
          // continue
        }
      }
      if (!cancelled) setError('Could not connect to the backend. Please enter the API URL.')
    }

    tryCandidates()
    return () => { cancelled = true }
  }, [])

  const setManual = (base) => {
    setApiBase(base)
    try {
      localStorage.setItem('apiBase', base)
    } catch {}
  }

  return { apiBase, setManual, error }
}

export default function StageBoard({ mode }) {
  const { apiBase, setManual, error: apiError } = useApiDiscovery()
  const [process, setProcess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState({})
  const [error, setError] = useState(null)
  const manualRef = useRef(null)

  const fetchProcess = async (base) => {
    setLoading(true)
    setError(null)
    try {
      await fetch(`${base}/api/seed`).catch(()=>{})
      const res = await fetch(`${base}/api/process`)
      if (!res.ok) throw new Error(`Process request failed: ${res.status}`)
      const data = await res.json()
      if (!data || !Array.isArray(data.stages)) throw new Error('Invalid process payload')
      setProcess(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async (base) => {
    if (!base) return
    try {
      const res = await fetch(`${base}/api/logs`)
      if (!res.ok) return
      const data = await res.json()
      const group = {}
      ;(data.logs || []).forEach(l => {
        const key = `${l.stage_key}:${l.item_key}`
        group[key] = group[key] || []
        group[key].push(l)
      })
      setLogs(group)
    } catch {}
  }

  useEffect(() => {
    if (!apiBase) return
    fetchProcess(apiBase)
  }, [apiBase])

  useEffect(() => {
    if (!apiBase) return
    fetchLogs(apiBase)
    const t = setInterval(() => fetchLogs(apiBase), 1500)
    return () => clearInterval(t)
  }, [apiBase])

  const onUpload = async (stageKey, itemKey, file) => {
    if (!apiBase) return
    const fd = new FormData()
    fd.append('item_key', itemKey)
    fd.append('stage_key', stageKey)
    fd.append('file', file)
    fd.append('actor', 'requester')
    await fetch(`${apiBase}/api/upload`, { method: 'POST', body: fd })
    fetchLogs(apiBase)
  }

  const onAssign = async (stageKey, itemKey, assignee) => {
    if (!apiBase) return
    await fetch(`${apiBase}/api/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage_key: stageKey, item_key: itemKey, assignee, actor: 'admin' }) })
    fetchLogs(apiBase)
  }

  const onAction = async (stageKey, itemKey, action) => {
    if (!apiBase) return
    await fetch(`${apiBase}/api/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage_key: stageKey, item_key: itemKey, action, actor: mode === 'admin' ? 'admin' : 'assignee', note: action==='note' ? 'Added a note' : undefined }) })
    fetchLogs(apiBase)
  }

  if (!apiBase) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Connecting to backend…</div>
            <div className="text-sm opacity-90">{apiError ? apiError : 'Trying common URLs automatically.'}</div>
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1">
                <input ref={manualRef} placeholder="Paste your API base URL (e.g., https://…-8000.modal.host)" className="w-full px-3 py-2 pr-10 border rounded-md text-sm" />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <button onClick={() => manualRef.current?.value && setManual(manualRef.current.value.trim())} className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white">Connect</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !process) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border shadow-sm">
          <Clock4 className="w-4 h-4 text-amber-500" />
          <span className="text-slate-700">Loading process…</span>
        </div>
        {error && (
          <div className="mt-4 text-sm text-rose-600">{error}</div>
        )}
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
