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
      <button
        type="button"
        onClick={onEndTrip}
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
        }}
        className="w-full py-3.5 rounded-2xl text-sm font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
      >
        <Flag className="w-4 h-4" />
        Kết thúc chuyến đi & Xem chia tiền
      </button>
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
        className="rounded-2xl p-5 text-center text-xs border-2 shadow-sm space-y-3 animate-fade-in"
      >
        <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
          Tất cả thành viên đã cân bằng chi tiêu (hoặc chưa có khoản chi nào).
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
          <button
            type="button"
            onClick={onTriggerAddExpense}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
            className="px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Bổ sung khoản chi
          </button>
          <button
            type="button"
            onClick={onEndTrip}
            style={{ color: 'var(--text-muted)' }}
            className="px-4 py-2 font-semibold hover:underline cursor-pointer"
          >
            Mở lại chuyến đi
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SendHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-xs uppercase tracking-wider">
            Gợi ý chuyển tiền ({transactions.length} giao dịch)
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
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Đã tự động tính toán lại số tiền cần chuyển theo khoản chi mới!</span>
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

      {/* Quick Add Missing Expense Prompt Card */}
      <div
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
        }}
        className="p-3 rounded-xl border flex items-center justify-between gap-2 shadow-2xs"
      >
        <div className="min-w-0 pr-1">
          <span className="font-extrabold text-xs block truncate">Phát hiện còn khoản chi chưa nhập?</span>
          <span className="text-[11px] opacity-75 truncate block" style={{ color: 'var(--text-muted)' }}>
            Bổ sung ngay, bảng chia tiền sẽ tự động cập nhật
          </span>
        </div>
        <button
          type="button"
          onClick={onTriggerAddExpense}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Bổ sung ngay
        </button>
      </div>

      {isAllCompleted && (
        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Tất cả đã thanh toán xong! Sòng phẳng trọn vẹn.
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
            backgroundColor: 'var(--badge-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--badge-text)',
          }}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:opacity-90"
        >
          <PlusCircle className="w-4 h-4" /> Bổ sung khoản chi còn thiếu
        </button>
        <button
          type="button"
          onClick={onEndTrip}
          style={{ color: 'var(--text-muted)' }}
          className="w-full py-2 text-xs font-semibold hover:underline transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Mở lại chuyến đi (tiếp tục thêm chi tiêu)
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
