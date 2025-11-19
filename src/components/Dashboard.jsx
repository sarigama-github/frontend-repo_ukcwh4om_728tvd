import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import RoleToggle from './RoleToggle'
import StageCard from './StageCard'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Dashboard() {
  const [role, setRole] = useState('user')
  const [process, setProcess] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const stageLogs = useMemo(() => {
    const map = {}
    logs.forEach(l => {
      map[l.stage_key] = map[l.stage_key] || []
      map[l.stage_key].push(l)
    })
    return map
  }, [logs])

  const fetchProcess = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/process`)
      const data = await r.json()
      setProcess(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const r = await fetch(`${API}/api/logs`)
      const data = await r.json()
      setLogs(data.logs || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchProcess()
    fetchLogs()
    const id = setInterval(fetchLogs, 2000)
    return () => clearInterval(id)
  }, [])

  const handleUpload = async (stageKey, itemKey, file) => {
    const form = new FormData()
    form.append('stage_key', stageKey)
    form.append('item_key', itemKey)
    form.append('file', file)
    form.append('actor', role)
    await fetch(`${API}/api/upload`, { method: 'POST', body: form })
    fetchLogs()
  }

  const handleAssign = async (stageKey) => {
    const assignee = prompt('Assign to (name):', 'Alex')
    if (!assignee) return
    await fetch(`${API}/api/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_key: stageKey, item_key: 'doc_review', assignee, actor: 'admin' })
    })
    fetchLogs()
  }

  const handleAction = async (stageKey, action) => {
    await fetch(`${API}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_key: stageKey, item_key: 'doc_review', action, actor: role })
    })
    fetchLogs()
  }

  if (loading || !process) {
    return (
      <div className="py-20 text-center text-slate-500">Loading process...</div>
    )
  }

  return (
    <section className="relative -mt-20 pt-6 pb-16">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span className="text-sm text-slate-500">Interactive prototype</span>
          </div>
          <RoleToggle role={role} onChange={setRole} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {process.stages.map((stage) => (
            <StageCard
              key={stage.key}
              stage={stage}
              role={role}
              logs={(stageLogs[stage.key] || [])}
              onUpload={handleUpload}
              onAssign={handleAssign}
              onAction={handleAction}
              done={(stageLogs[stage.key] || []).some(l => l.type === 'decision')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Dashboard
