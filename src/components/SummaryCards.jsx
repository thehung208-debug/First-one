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
      className="rounded-2xl p-4 flex items-center gap-3.5 border-2 shadow-sm transition-all duration-300"
    >
      <div
        style={{
          backgroundColor: 'var(--badge-bg)',
          color: 'var(--accent)',
          borderColor: 'var(--card-border)',
        }}
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
      >
        <Wallet className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>
          {formatVND(totalSpendingVND)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-black flex items-center justify-end gap-1" style={{ color: 'var(--text-main)' }}>
          <Users className="w-3.5 h-3.5 opacity-60" />
          <span>{formatVND(averagePerPersonVND)}</span>
        </div>
      </div>
    </div>
  )
}
