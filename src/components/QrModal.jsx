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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="rounded-3xl shadow-2xl border-2 w-full max-w-md overflow-hidden animate-fade-in"
      >
        <div
          style={{
            backgroundColor: 'var(--header-bg)',
            borderColor: 'var(--header-border)',
          }}
          className="px-5 py-4 border-b-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h3 className="font-black text-base sm:text-lg">
              Mã VietQR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Transaction Info Summary */}
          <div
            style={{
              backgroundColor: 'var(--badge-bg)',
              borderColor: 'var(--card-border)',
            }}
            className="p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="text-xs opacity-70 block font-medium">Chuyển đến:</span>
              <span className="font-extrabold text-sm sm:text-base truncate block" style={{ color: 'var(--accent)' }}>
                {transaction.toName}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs opacity-70 block font-medium">Số tiền:</span>
              <span className="font-black text-base sm:text-lg tracking-tight" style={{ color: 'var(--accent)' }}>
                {formatVND(transaction.amountVND)}
              </span>
            </div>
          </div>

          {/* Bank Account Settings */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold block mb-1 opacity-80">Ngân hàng:</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
                className="w-full px-3 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm min-h-[46px]"
              >
                {POPULAR_BANKS.map(b => (
                  <option key={b.code} value={b.code}>
                    {b.shortName} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1 opacity-80">Số tài khoản:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-main)',
                }}
                className="w-full px-3 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm min-h-[46px]"
              />
            </div>
          </div>

          {/* QR Code Display */}
          <div
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border-2"
          >
            {qrUrl ? (
              <div className="text-center space-y-2">
                <img
                  src={qrUrl}
                  alt="VietQR code"
                  className="w-56 h-auto mx-auto rounded-xl shadow-xs border bg-white p-2"
                />
                <p className="text-xs opacity-70 font-medium">
                  Mở ứng dụng ngân hàng quét mã để chuyển ngay
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs opacity-60">
                Nhập số tài khoản của <b>{transaction.toName}</b> để tạo mã QR.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={copyInfo}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer min-h-[48px]"
            >
              {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
              className="px-5 py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer min-h-[48px]"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
