import React, { useState, useEffect } from 'react'
import { Plus, Check, User, Users, Sparkles, CheckCheck } from 'lucide-react'
import { SUPPORTED_CURRENCIES, convertToVND, formatVND } from '../utils/currency'

function formatInputDisplay(value) {
  if (!value && value !== 0) return ''
  const str = String(value)
  const parts = str.split('.')
  const intPart = parts[0] || ''
  const decPart = parts.length > 1 ? parts[1] : null
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decPart !== null ? formatted + ',' + decPart : formatted
}

function parseInputValue(displayStr) {
  if (!displayStr) return ''
  return displayStr.replace(/\./g, '').replace(',', '.')
}

export default function ExpenseForm({
  members,
  rates,
  onAddExpense,
  editingExpense,
  onCancelEdit,
  onUpdateExpense,
  tripEnded = false,
  isHighlighted = false,
  formRef,
  titleInputRef
}) {
  const [title, setTitle] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [currency, setCurrency] = useState('VND')
  const [paidById, setPaidById] = useState('')
  const [participantIds, setParticipantIds] = useState([])
  const [category, setCategory] = useState('food')

  useEffect(() => {
    if (members.length > 0) {
      if (!paidById || !members.some(m => m.id === paidById)) {
        setPaidById(members[0].id)
      }
      const validParticipants = participantIds.filter(id => members.some(m => m.id === id))
      if (validParticipants.length === 0) {
        setParticipantIds(members.map(m => m.id))
      } else if (validParticipants.length !== participantIds.length) {
        setParticipantIds(validParticipants)
      }
    } else {
      setPaidById('')
      setParticipantIds([])
    }
  }, [members])

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title)
      setAmountDisplay(formatInputDisplay(editingExpense.amount))
      setCurrency(editingExpense.currency)
      setPaidById(editingExpense.paidById)
      setParticipantIds(editingExpense.participantIds || members.map(m => m.id))
      setCategory(editingExpense.category || 'food')
    }
  }, [editingExpense, members])

  const handleCancelEdit = () => {
    setTitle('')
    setAmountDisplay('')
    if (members.length > 0) {
      setPaidById(members[0].id)
      setParticipantIds(members.map(m => m.id))
    }
    onCancelEdit()
  }

  const rawValue = parseInputValue(amountDisplay)
  const numAmount = parseFloat(rawValue) || 0
  const convertedVND = convertToVND(numAmount, currency, rates)

  const handleAmountChange = (e) => {
    let input = e.target.value.replace(/\./g, '').replace(/[^\d,]/g, '')
    const commaParts = input.split(',')
    let intPart = commaParts[0]
    let decPart = commaParts.length > 1 ? commaParts.slice(1).join('') : null

    if (intPart.length > 1 && intPart.startsWith('0')) {
      intPart = intPart.replace(/^0+/, '') || '0'
    }

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setAmountDisplay(decPart !== null ? formattedInt + ',' + decPart : formattedInt)
  }

  const handleToggleParticipant = (id) => {
    setParticipantIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id)
      }
      return [...prev, id]
    })
  }

  const isAllSelected = members.length > 0 && members.every(m => participantIds.includes(m.id))

  const handleToggleAllParticipants = () => {
    if (isAllSelected) {
      const keepId = members.some(m => m.id === paidById) ? paidById : members[0]?.id
      setParticipantIds(keepId ? [keepId] : [])
    } else {
      setParticipantIds(members.map(m => m.id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || numAmount <= 0 || !paidById) return

    const payload = {
      title: title.trim(),
      amount: numAmount,
      currency,
      paidById,
      participantIds: participantIds.length > 0 ? participantIds : members.map(m => m.id),
      category,
      date: new Date().toISOString().split('T')[0]
    }

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, payload)
      handleCancelEdit()
    } else {
      onAddExpense({
        ...payload,
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      })
      setTitle('')
      setAmountDisplay('')
    }
  }

  if (members.length < 2) {
    return (
      <div
        ref={formRef}
        id="expense-form-section"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="rounded-2xl p-6 text-center text-sm border-2 shadow-sm"
      >
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="font-semibold">Thêm ít nhất 2 thành viên</p>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      id="expense-form-section"
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: isHighlighted ? 'var(--accent)' : 'var(--card-border)',
        color: 'var(--text-main)',
      }}
      className={`rounded-3xl p-4 sm:p-5 space-y-4 border-2 shadow-sm transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-rose-400/60 shadow-lg scale-[1.01]' : ''
      }`}
    >
      {/* Alert banner when trip is ended and user is adding missing expenses */}
      {tripEnded && !editingExpense && (
        <div
          style={{
            backgroundColor: 'var(--badge-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--badge-text)',
          }}
          className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-between gap-2 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Thêm khoản mới sẽ tiếp tục chuyến đi</span>
          </div>
        </div>
      )}

      {editingExpense && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span style={{ color: 'var(--accent)' }}>Sửa khoản chi</span>
          <button type="button" onClick={handleCancelEdit} className="opacity-70 hover:opacity-100 underline cursor-pointer">Hủy</button>
        </div>
      )}

      {/* Title */}
      <input
        ref={titleInputRef}
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-main)',
        }}
        className="w-full px-4 py-3.5 text-base sm:text-lg rounded-2xl border focus:outline-none transition-all font-medium min-h-[50px]"
      />

      {/* Amount + Currency row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            required
            value={amountDisplay}
            onChange={handleAmountChange}
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-main)',
            }}
            className="w-full pl-4 pr-12 py-3 text-2xl sm:text-3xl font-black rounded-2xl border focus:outline-none transition-all tracking-tight min-h-[54px]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-60">
            {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || currency}
          </span>
        </div>

        {/* Quick currency pills */}
        <div className="flex items-center gap-1.5">
          {['VND', 'EUR', 'PLN', 'USD'].map(c => {
            const active = currency === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                style={{
                  backgroundColor: active ? 'var(--accent)' : 'var(--input-bg)',
                  borderColor: active ? 'var(--accent)' : 'var(--input-border)',
                  color: active ? 'var(--accent-text)' : 'var(--text-main)',
                }}
                className="px-3.5 py-2.5 text-sm sm:text-base font-extrabold rounded-2xl border transition-all cursor-pointer shadow-2xs min-h-[54px] min-w-[46px] flex items-center justify-center active:scale-95"
              >
                {c === 'PLN' ? 'zł' : c === 'EUR' ? '€' : c === 'USD' ? '$' : '₫'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Converted VND preview */}
      {numAmount > 0 && currency !== 'VND' && (
        <div
          style={{
            backgroundColor: 'var(--badge-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--badge-text)',
          }}
          className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-end animate-fade-in"
        >
          <span className="text-base font-black tracking-tight">≈ {formatVND(convertedVND)}</span>
        </div>
      )}

      {/* Who paid + Who splits */}
      <div className="grid grid-cols-2 gap-3">
        {/* Payer */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--accent)' }} />
          </label>
          <div
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
            }}
            className="flex flex-wrap gap-1.5 p-2 rounded-2xl border max-h-40 overflow-y-auto"
          >
            {members.map(m => {
              const isSelected = paidById === m.id
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaidById(m.id)}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--card-bg)',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-main)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--input-border)',
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs min-h-[42px] active:scale-95"
                >
                  <div
                    className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <span className="truncate">{m.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--accent)' }} />
              <span className="text-xs opacity-75">({participantIds.length}/{members.length})</span>
            </label>
            <button
              type="button"
              onClick={handleToggleAllParticipants}
              style={{
                backgroundColor: isAllSelected ? 'var(--badge-bg)' : 'transparent',
                color: 'var(--accent)',
                borderColor: 'var(--card-border)',
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl border hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
              title={isAllSelected ? 'Bỏ chọn' : 'Chọn hết'}
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          </div>
          <div
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
            }}
            className="flex flex-wrap gap-1.5 p-2 rounded-2xl border max-h-40 overflow-y-auto"
          >
            {/* Quick prominent All Pill */}
            <button
              type="button"
              onClick={handleToggleAllParticipants}
              style={{
                backgroundColor: isAllSelected ? 'var(--accent)' : 'var(--card-bg)',
                color: isAllSelected ? 'var(--accent-text)' : 'var(--text-main)',
                borderColor: isAllSelected ? 'var(--accent)' : 'var(--input-border)',
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer min-h-[42px] active:scale-95 ${
                isAllSelected ? 'shadow-2xs' : 'opacity-75 hover:opacity-100 hover:border-rose-600'
              }`}
              title={isAllSelected ? 'Bỏ chọn' : 'Chọn hết'}
            >
              <Users className="w-4 h-4" />
              <span>All</span>
            </button>

            {members.map(m => {
              const included = participantIds.includes(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleToggleParticipant(m.id)}
                  style={{
                    backgroundColor: included ? 'var(--accent)' : 'transparent',
                    color: included ? 'var(--accent-text)' : 'var(--text-muted)',
                    borderColor: included ? 'var(--accent)' : 'transparent',
                  }}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] active:scale-95 flex items-center ${
                    included ? 'shadow-2xs' : 'opacity-40 line-through'
                  }`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!title.trim() || numAmount <= 0 || !paidById}
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
        }}
        className="w-full py-4 rounded-2xl sm:rounded-3xl text-base font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 active:scale-98 min-h-[54px]"
      >
        {editingExpense ? (
          <Check className="w-6 h-6 stroke-[3]" />
        ) : (
          <Plus className="w-6 h-6 stroke-[3]" />
        )}
      </button>
    </form>
  )
}
