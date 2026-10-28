import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="w-full max-w-sm rounded-3xl border-2 shadow-2xl p-5 sm:p-6 space-y-4 animate-fade-in"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-black text-base sm:text-lg leading-snug">
              {title}
            </h3>
            {message && (
              <p
                className="text-xs sm:text-sm font-medium opacity-85 mt-1.5 leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-main)',
            }}
            className="flex-1 py-3.5 px-3 rounded-2xl text-sm sm:text-base font-bold border hover:bg-black/5 active:scale-95 transition-all cursor-pointer min-h-[50px] flex items-center justify-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: isDanger ? '#e11d48' : 'var(--accent)',
              color: '#ffffff',
            }}
            className="flex-1 py-3.5 px-3 rounded-2xl text-sm sm:text-base font-bold shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer min-h-[50px] flex items-center justify-center"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
