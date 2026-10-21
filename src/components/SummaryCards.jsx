import React from 'react'
import { Wallet } from 'lucide-react'
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
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Tổng chi tiêu đoàn
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>
          {formatVND(totalSpendingVND)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          TB / người
        </div>
        <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
          {formatVND(averagePerPersonVND)}
        </div>
      </div>
    </div>
  )
}
