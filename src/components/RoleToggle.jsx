import * as Switch from '@radix-ui/react-switch'
import { Shield, User } from 'lucide-react'

function RoleToggle({ role, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 text-sm ${role === 'user' ? 'text-blue-600' : 'text-slate-500'}`}>
        <User className="w-4 h-4" />
        <span>User</span>
      </div>
      <Switch.Root
        className="w-14 h-7 bg-slate-200 data-[state=checked]:bg-rose-500 rounded-full relative outline-none cursor-pointer transition"
        checked={role === 'admin'}
        onCheckedChange={(v) => onChange(v ? 'admin' : 'user')}
      >
        <Switch.Thumb className="block w-6 h-6 bg-white rounded-full shadow-md translate-x-1 data-[state=checked]:translate-x-7 transition-transform will-change-transform" />
      </Switch.Root>
      <div className={`flex items-center gap-2 text-sm ${role === 'admin' ? 'text-rose-600' : 'text-slate-500'}`}>
        <Shield className="w-4 h-4" />
        <span>Admin</span>
      </div>
    </div>
  )
}

export default RoleToggle
