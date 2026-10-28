import React from 'react'
import { Wallet, Users } from 'lucide-react'
import { formatVND } from '../utils/currency'

export default function SummaryCards({ calculation }) {
  const { totalSpendingVND, averagePerPersonVND } = calculation

  if (totalSpendingVND === 0) return null

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-main)',
      }}
      className="rounded-3xl p-4 sm:p-5 flex items-center gap-4 border-2 shadow-sm transition-all duration-300"
    >
      <div
        style={{
          backgroundColor: 'var(--badge-bg)',
          color: 'var(--accent)',
          borderColor: 'var(--card-border)',
        }}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border"
      >
        <Wallet className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl sm:text-4xl font-black tracking-tight truncate leading-none" style={{ color: 'var(--accent)' }}>
          {formatVND(totalSpendingVND)}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm sm:text-base font-bold flex items-center justify-end gap-1.5" style={{ color: 'var(--text-main)' }}>
          <Users className="w-4 h-4 opacity-60" />
          <span>{formatVND(averagePerPersonVND)}</span>
        </div>
      </div>
    </div>
  )
}
