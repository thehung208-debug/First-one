import React, { useState } from 'react'
import { X, RotateCcw, Check, Info } from 'lucide-react'
import { SUPPORTED_CURRENCIES } from '../utils/currency'

export default function RatesModal({
  isOpen,
  onClose,
  rates,
  onSaveRates,
  onResetToLiveRates,
  ratesSource
}) {
  if (!isOpen) return null

  const [customRates, setCustomRates] = useState({ ...rates })

  const handleInputChange = (code, val) => {
    const num = parseFloat(val) || 0
    setCustomRates(prev => ({
      ...prev,
      [code]: num
    }))
  }

  const handleSave = () => {
    onSaveRates(customRates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5d8cc] w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eee3d7] flex items-center justify-between bg-[#fbf8f4]">
          <div>
            <h3 className="text-lg font-bold text-[#422d22]">Bảng tỷ giá quy đổi sang VNĐ</h3>
            <p className="text-xs text-[#7e6757]">
              Nguồn: {ratesSource || 'Trực tuyến'}. Bạn có thể tự chỉnh tỷ giá thực tế nếu muốn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200/80 rounded-xl text-xs text-sky-800">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Tỷ giá này được áp dụng tự động để quy đổi tất cả các khoản chi tiêu sang tiền VNĐ theo tỷ lệ 1 [Ngoại tệ] = X VNĐ.
            </p>
          </div>

          <div className="divide-y divide-[#f2e9e0]">
            {SUPPORTED_CURRENCIES.filter(c => c.code !== 'VND').map(curr => (
              <div key={curr.code} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{curr.flag}</span>
                  <div>
                    <div className="font-semibold text-sm text-[#422d22] flex items-center gap-1.5">
                      <span>{curr.code}</span>
                      <span className="text-xs text-[#8a7263] font-normal">({curr.name})</span>
                    </div>
                    <div className="text-xs text-stone-500">Ký hiệu: {curr.symbol}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">1 {curr.code} =</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={customRates[curr.code] || ''}
                      onChange={e => handleInputChange(curr.code, e.target.value)}
                      className="w-28 sm:w-32 px-2.5 py-1.5 text-right font-semibold text-sm text-[#422d22] bg-[#fdfbf9] border border-[#d8c8b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#664b3c]">₫</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#eee3d7] bg-[#fbf8f4] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onResetToLiveRates()
              onClose()
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lấy lại tỷ giá mạng</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng tỷ giá</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
