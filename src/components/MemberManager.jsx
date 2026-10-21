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
          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all"
        >
          <div
            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: m.color }}
          >
            {m.name.charAt(0).toUpperCase()}
          </div>

          {editingId === m.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-20 px-1.5 py-0.5 border rounded text-xs bg-white text-stone-900 focus:outline-none"
                style={{ borderColor: 'var(--accent)' }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
              />
              <button onClick={() => saveEdit(m.id)} className="text-emerald-600 p-0.5 cursor-pointer">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>{m.name}</span>
              <button
                onClick={() => { setEditingId(m.id); setEditName(m.name) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer text-stone-400 hover:text-stone-700"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRemoveMember(m.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Inline add */}
      <form onSubmit={handleAdd} className="inline-flex items-center gap-1.5">
        <input
          type="text"
          placeholder="Tên mới..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-main)',
          }}
          className="w-24 sm:w-28 px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none transition-all placeholder:text-stone-400"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="p-1.5 rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
