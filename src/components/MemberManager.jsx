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
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {members.map((m) => (
        <div
          key={m.id}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-main)',
          }}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-sm font-bold shadow-2xs transition-all min-h-[44px]"
        >
          <div
            className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
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
                className="w-28 px-2.5 py-1 border rounded-xl text-sm bg-white text-stone-900 focus:outline-none"
                style={{ borderColor: 'var(--accent)' }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
              />
              <button
                type="button"
                onClick={() => saveEdit(m.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{m.name}</span>
              <button
                type="button"
                onClick={() => { setEditingId(m.id); setEditName(m.name) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer text-stone-400 hover:text-stone-800 hover:bg-black/5 active:scale-90"
                title="Sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveMember(m.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Inline add */}
      <form onSubmit={handleAdd} className="inline-flex items-center gap-2">
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
          className="w-32 sm:w-44 px-3.5 py-2.5 text-sm sm:text-base rounded-2xl border focus:outline-none transition-all placeholder:text-stone-400 min-h-[46px]"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="w-12 h-12 rounded-2xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
