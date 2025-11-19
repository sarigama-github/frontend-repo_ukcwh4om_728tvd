import { useState } from 'react'
import Hero from './components/Hero'
import ToggleBar from './components/ToggleBar'
import StageBoard from './components/StageBoard'

function App() {
  const [mode, setMode] = useState('user')

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Hero />
      <ToggleBar mode={mode} setMode={setMode} />
      <StageBoard mode={mode} />
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">This is a live prototype demonstrating the end‑to‑end experience for requesters and admins.</p>
          <div className="text-xs text-slate-500">Admin/User toggle affects available actions above.</div>
        </div>
      </footer>
    </div>
  )
}

export default App
