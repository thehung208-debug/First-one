import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react'
import { convertToVND, formatVND, formatOriginalCurrency } from '../utils/currency'

const CATEGORY_ICONS = {
  food: '🍽️', stay: '🏨', transport: '🚗', ticket: '🎟️', other: '🛍️'
}

export default function ExpenseList({
  expenses,
  members,
  rates,
  onDeleteExpense,
  onEditExpense
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const memberMap = new Map(members.map(m => [m.id, m]))

  if (expenses.length === 0) return null

  const visibleExpenses = isExpanded ? expenses : expenses.slice(0, 3)
  const hasMore = expenses.length > 3

  return (
    <div className="space-y-2">
      <div className={`space-y-2 ${isExpanded ? 'max-h-[420px] overflow-y-auto pr-1' : ''}`}>
        {visibleExpenses.map((exp) => {
          const payer = memberMap.get(exp.paidById)
          const amountVND = convertToVND(exp.amount, exp.currency, rates)
          const participants = (exp.participantIds || []).map(id => memberMap.get(id)?.name).filter(Boolean)
          const isAll = participants.length === members.length

          return (
            <div
              key={exp.id}
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
              className="px-3.5 py-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group shadow-2xs min-h-[54px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{CATEGORY_ICONS[exp.category] || '💸'}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm sm:text-base truncate">{exp.title}</div>
                  <div className="text-xs sm:text-sm opacity-80 mt-0.5">
                    <span className="font-extrabold" style={{ color: 'var(--accent)' }}>{payer?.name}</span>
                    {' · '}
                    {isAll ? 'tất cả' : participants.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <div className="text-sm sm:text-base font-black" style={{ color: 'var(--accent)' }}>
                    {formatVND(amountVND)}
                  </div>
                  {exp.currency !== 'VND' && (
                    <div className="text-xs font-bold opacity-75">
                      {formatOriginalCurrency(exp.amount, exp.currency)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEditExpense(exp)}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center opacity-85 hover:opacity-100 hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(exp.id)}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center opacity-85 hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer text-stone-400"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ color: 'var(--accent)' }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold hover:underline transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <><ChevronUp className="w-4 h-4" /> Thu gọn</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Xem thêm ({expenses.length - 3})</>
          )}
        </button>
      )}
    </div>
  )
}
