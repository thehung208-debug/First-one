import React, { useState } from 'react'
import { X, QrCode, Copy, Check, ExternalLink } from 'lucide-react'
import { formatVND } from '../utils/currency'

// Common Vietnamese banks list for VietQR
const POPULAR_BANKS = [
  { bin: '970436', shortName: 'Vietcombank', code: 'VCB' },
  { bin: '970407', shortName: 'Techcombank', code: 'TCB' },
  { bin: '970422', shortName: 'MBBank', code: 'MB' },
  { bin: '970415', shortName: 'VietinBank', code: 'CTG' },
  { bin: '970418', shortName: 'BIDV', code: 'BIDV' },
  { bin: '970416', shortName: 'ACB', code: 'ACB' },
  { bin: '970423', shortName: 'TPBank', code: 'TPB' },
  { bin: '970432', shortName: 'VPBank', code: 'VPB' },
  { bin: '970403', shortName: 'Sacombank', code: 'STB' },
]

export default function QrModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null

  const [bankCode, setBankCode] = useState(
    POPULAR_BANKS.find(b => b.shortName.toLowerCase().includes(transaction.toMember?.bankName?.toLowerCase() || ''))?.code || 'VCB'
  )
  const [accountNumber, setAccountNumber] = useState(transaction.toMember?.bankAccount || '')
  const [accountName, setAccountName] = useState(transaction.toName || '')
  const [copied, setCopied] = useState(false)

  const transferContent = `Chia tien du lich - ${transaction.fromName}`
  const qrUrl = accountNumber.trim()
    ? `https://img.vietqr.io/image/${bankCode}-${accountNumber.trim()}-compact2.png?amount=${transaction.amountVND}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`
    : null

  const copyInfo = () => {
    const text = `Ngân hàng: ${bankCode}\nSố tài khoản: ${accountNumber}\nChủ tài khoản: ${accountName}\nSố tiền: ${formatVND(transaction.amountVND)}\nNội dung: ${transferContent}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5d8cc] w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-[#eee3d7] flex items-center justify-between bg-[#fbf8f4]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-sm sm:text-base text-[#422d22]">
              Mã VietQR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Transaction Info Summary */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-stone-500 block">Người chuyển ➔ Người nhận:</span>
              <span className="font-bold text-[#422d22]">
                {transaction.fromName} ➔ {transaction.toName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-stone-500 block">Số tiền:</span>
              <span className="font-extrabold text-sm text-sky-700">
                {formatVND(transaction.amountVND)}
              </span>
            </div>
          </div>

          {/* Bank Account Settings */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Ngân hàng nhận:</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#fcfaf7] border border-[#d8c8b8] rounded-lg text-[#422d22] font-medium"
              >
                {POPULAR_BANKS.map(b => (
                  <option key={b.code} value={b.code}>
                    {b.shortName} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Số tài khoản:</label>
              <input
                type="text"
                placeholder="Nhập STK nhận tiền..."
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#fcfaf7] border border-[#d8c8b8] rounded-lg text-[#422d22] font-semibold"
              />
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-xl border border-stone-200">
            {qrUrl ? (
              <div className="text-center space-y-2">
                <img
                  src={qrUrl}
                  alt="VietQR code"
                  className="w-56 h-auto mx-auto rounded-lg shadow-sm border border-stone-200"
                />
                <p className="text-[11px] text-stone-500">
                  Mở ứng dụng ngân hàng bất kỳ (VCB, TCB, MB...) quét mã để chuyển tiền ngay.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-stone-400">
                Vui lòng điền Số tài khoản của <b>{transaction.toName}</b> ở trên để tạo mã QR.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#eee3d7]">
            <button
              type="button"
              onClick={copyInfo}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#faf3eb] hover:bg-[#f3e6d8] text-[#78350f] font-semibold border border-[#eedcc8] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép thông tin'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
