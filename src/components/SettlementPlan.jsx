import React, { useState } from 'react'
import { Flag, ArrowRight, CheckCircle2, Circle, QrCode, Sparkles, SendHorizontal, PlusCircle, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'
import { formatVND } from '../utils/currency'
import QrModal from './QrModal'

export default function SettlementPlan({
  calculation,
  completedTxIds,
  onToggleCompleteTx,
  tripEnded,
  onEndTrip,
  onTriggerAddExpense,
  recentlyRecalculated = false,
  onDismissRecalculated
}) {
  const { transactions } = calculation
  const [selectedTxForQr, setSelectedTxForQr] = useState(null)

  const completedCount = transactions.filter(tx => completedTxIds.includes(tx.id)).length
  const isAllCompleted = transactions.length > 0 && completedCount === transactions.length

  const handleToggle = (txId) => {
    const isNowDone = !completedTxIds.includes(txId)
    onToggleCompleteTx(txId)
    if (isNowDone && completedCount + 1 === transactions.length) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    }
  }

  // Not ended yet — show the "End Trip" button
  if (!tripEnded) {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={onEndTrip}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="w-full py-3 rounded-2xl text-sm font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
        >
          <Flag className="w-4 h-4" />
          Kết thúc & Tính tiền
        </button>
      </div>
    )
  }

  // Trip ended but no transactions
  if (transactions.length === 0) {
    return (
      <div
        id="settlement-plan-section"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="rounded-2xl p-4 text-center text-xs border-2 shadow-sm space-y-2.5 animate-fade-in"
      >
        <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-rose-800">
          <Flag className="w-3.5 h-3.5" />
          <span>Đã kết thúc</span>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Đã cân bằng chi tiêu.
        </p>
        <div className="flex gap-2 justify-center pt-1">
          <button
            type="button"
            onClick={onTriggerAddExpense}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
            className="px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Thêm chi tiêu
          </button>
          <button
            type="button"
            onClick={onEndTrip}
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-main)',
            }}
            className="px-3 py-1.5 rounded-xl font-bold border hover:border-rose-600 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Tiếp tục đi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      id="settlement-plan-section"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-main)',
      }}
      className="rounded-2xl p-4 space-y-3.5 border-2 shadow-sm animate-fade-in transition-all duration-300"
    >
      {/* Top Banner: Đã kết thúc & Nút đi tiếp */}
      <div
        style={{
          backgroundColor: 'var(--badge-bg)',
          borderColor: 'var(--card-border)',
        }}
        className="px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--accent)' }}>
          <Flag className="w-3.5 h-3.5" />
          <span>Đã kết thúc</span>
        </div>

        <button
          type="button"
          onClick={onEndTrip}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
          }}
          className="px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3 h-3" /> Tiếp tục đi
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SendHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-xs uppercase tracking-wider">
            Chuyển tiền ({transactions.length})
          </span>
        </div>
        {transactions.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
              {completedCount}/{transactions.length}
            </span>
            <div className="w-16 h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(completedCount / transactions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recalculated Notification Banner */}
      {recentlyRecalculated && (
        <div className="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-900 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Đã cập nhật số tiền</span>
          </div>
          {onDismissRecalculated && (
            <button
              type="button"
              onClick={onDismissRecalculated}
              className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      )}

      {isAllCompleted && (
        <div className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Đã thanh toán xong!
        </div>
      )}

      <div className="space-y-2">
        {transactions.map((tx) => {
          const isDone = completedTxIds.includes(tx.id)
          return (
            <div
              key={tx.id}
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
              }}
              className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                isDone ? 'opacity-40' : 'shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(tx.id)}
                  className="opacity-70 hover:opacity-100 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5" />}
                </button>

                <div
                  className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: tx.fromMember?.color || '#78350f' }}
                >
                  {tx.fromName.charAt(0)}
                </div>
                <span className={`font-bold text-xs truncate ${isDone ? 'line-through opacity-50' : ''}`}>
                  {tx.fromName}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                <div
                  className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: tx.toMember?.color || '#0284c7' }}
                >
                  {tx.toName.charAt(0)}
                </div>
                <span className={`font-bold text-xs truncate ${isDone ? 'line-through opacity-50' : ''}`}>
                  {tx.toName}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  style={{ color: isDone ? 'var(--text-muted)' : 'var(--accent)' }}
                  className="font-black text-sm tracking-tight"
                >
                  {formatVND(tx.amountVND)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTxForQr(tx)}
                  style={{
                    backgroundColor: 'var(--badge-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--badge-text)',
                  }}
                  className="p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs hover:opacity-90"
                  title="VietQR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons at bottom */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          onClick={onTriggerAddExpense}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Thêm chi tiêu
        </button>
        <button
          type="button"
          onClick={onEndTrip}
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-main)',
          }}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border hover:border-rose-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Tiếp tục đi
        </button>
      </div>

      {selectedTxForQr && (
        <QrModal
          isOpen={Boolean(selectedTxForQr)}
          onClose={() => setSelectedTxForQr(null)}
          transaction={selectedTxForQr}
        />
      )}
    </div>
  )
}
