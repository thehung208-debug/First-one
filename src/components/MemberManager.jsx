import React, { useState } from 'react'
import { UserPlus, Trash2, Edit2, Check } from 'lucide-react'

const AVATAR_COLORS = [
  '#0284c7', '#78350f', '#0369a1', '#92400e',
  '#0284c7', '#b45309', '#38bdf8', '#5c4033',
]

export default function MemberManager({ members, onAddMember, onRemoveMember, onUpdateMember }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    onAddMember({
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      color: AVATAR_COLORS[members.length % AVATAR_COLORS.length],
    })
    setNewName('')
  }

  const saveEdit = (id) => {
    if (editName.trim()) onUpdateMember(id, { name: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {members.map((m) => (
        <div
          key={m.id}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-main)',
          }}
          className="group inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs transition-all min-h-[38px]"
        >
          <div
            className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: m.color }}
          >
            {m.name.charAt(0).toUpperCase()}
          </div>

          {editingId === m.id ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-24 px-2 py-1 border rounded-lg text-xs bg-white text-stone-900 focus:outline-none"
                style={{ borderColor: 'var(--accent)' }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
              />
              <button
                type="button"
                onClick={() => saveEdit(m.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="truncate max-w-[120px]">{m.name}</span>
              <button
                type="button"
                onClick={() => { setEditingId(m.id); setEditName(m.name) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer text-stone-400 hover:text-stone-800 hover:bg-black/5 active:scale-90"
                title="Sửa"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveMember(m.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Inline add */}
      <form onSubmit={handleAdd} className="inline-flex items-center gap-1.5">
        <input
          type="text"
          placeholder="Tên..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-main)',
          }}
          className="w-28 sm:w-36 px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all placeholder:text-stone-400 min-h-[38px]"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="w-10 h-10 rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
