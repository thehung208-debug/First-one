import React, { useState } from 'react'
import { X, Copy, Check, Download, Share2 } from 'lucide-react'
import { generateShareableReport } from '../utils/settlement'

export default function ExportModal({
  isOpen,
  onClose,
  members,
  expenses,
  rates,
  calculation
}) {
  if (!isOpen) return null

  const [copied, setCopied] = useState(false)
  const reportText = generateShareableReport(members, expenses, rates, calculation)

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TripSplit_Bao_Cao_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5d8cc] w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eee3d7] flex items-center justify-between bg-[#fbf8f4]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#422d22]">
                Xuất báo cáo chi tiêu chuyến đi
              </h3>
              <p className="text-xs text-[#7e6757]">
                Định dạng sẵn sàng để gửi vào nhóm Zalo, Telegram, Messenger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          <textarea
            readOnly
            value={reportText}
            className="w-full h-80 p-3.5 bg-[#fcfaf7] border border-[#d8c8b8] rounded-xl text-xs font-mono text-[#3d2b21] focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#eee3d7] bg-[#fbf8f4] flex items-center justify-between gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file .txt</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép vào bộ nhớ!' : 'Sao chép nội dung'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
