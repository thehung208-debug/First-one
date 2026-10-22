import React, { useState } from 'react'
import {
  Compass,
  Plus,
  ArrowRight,
  Clock,
  Flag,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PlaneTakeoff,
  Luggage,
  X
} from 'lucide-react'
import { convertToVND, formatVND } from '../utils/currency'

export default function WelcomeGateway({
  trips,
  activeTripId,
  rates,
  onContinueTrip,
  onCreateNewTrip,
  onDismiss
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTripName, setNewTripName] = useState('')
  const [copyMembers, setCopyMembers] = useState(false)
  const [showOtherTrips, setShowOtherTrips] = useState(false)

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0]
  const otherTrips = trips.filter(t => t.id !== activeTrip?.id)

  const getTripStats = (trip) => {
    const totalVND = (trip.expenses || []).reduce((sum, exp) => {
      return sum + convertToVND(exp.amount, exp.currency, rates)
    }, 0)
    const expenseCount = trip.expenses?.length || 0
    const memberCount = trip.members?.length || 0
    return { totalVND, expenseCount, memberCount }
  }

  const handleStartCreate = () => {
    setIsCreating(true)
    setNewTripName(`Chuyến đi ${trips.length + 1}`)
    setCopyMembers(false)
  }

  const handleConfirmCreate = (e) => {
    e.preventDefault()
    if (!newTripName.trim()) return

    onCreateNewTrip({
      name: newTripName.trim(),
      copyMembersFromActive: copyMembers
    })
  }

  const activeStats = activeTrip ? getTripStats(activeTrip) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Background container */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="relative w-full max-w-lg rounded-3xl border-2 shadow-2xl p-5 sm:p-7 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Quick Close Button in corner */}
        <button
          type="button"
          onClick={onDismiss}
          style={{ color: 'var(--text-muted)' }}
          className="absolute top-4 right-4 p-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Bỏ qua"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-block relative">
            <img
              src="/forrest.png"
              alt="Forrest Gump"
              style={{ borderColor: 'var(--accent)' }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border-2 rotate-[-2deg] mx-auto"
            />
          </div>
          <div>
            <h2
              style={{ color: 'var(--accent)' }}
              className="text-2xl sm:text-3xl font-black tracking-tight"
            >
              Forrest Gump
            </h2>
            <p className="text-xs sm:text-sm font-semibold opacity-75" style={{ color: 'var(--text-muted)' }}>
              Sổ tay chia tiền du lịch đa tiền tệ
            </p>
          </div>
          <p className="text-xs sm:text-sm font-bold pt-1">
            Chào bạn! Hôm nay bạn muốn tiếp tục hay bắt đầu chuyến đi mới?
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3.5">
          {/* OPTION 1: Continue Active Trip */}
          {activeTrip && (
            <div
              style={{
                backgroundColor: 'var(--badge-bg)',
                borderColor: 'var(--card-border)',
              }}
              className="p-4 rounded-2xl border-2 space-y-3 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                  <Luggage className="w-3.5 h-3.5" /> Tiếp tục chuyến gần nhất
                </span>
                {!activeTrip.tripEnded ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" /> Đang diễn ra
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-900 bg-rose-500/20 px-2 py-0.5 rounded-full">
                    <Flag className="w-2.5 h-2.5" /> Đang chia tiền
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black truncate">
                    {activeTrip.name}
                  </h3>
                  <p className="text-xs opacity-75 font-medium flex items-center gap-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <span>{activeStats.memberCount} người</span>
                    <span>·</span>
                    <span>{activeStats.expenseCount} khoản chi</span>
                    <span>·</span>
                    <span className="font-extrabold" style={{ color: 'var(--accent)' }}>
                      {formatVND(activeStats.totalVND)}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onContinueTrip(activeTrip.id)}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-text)',
                }}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Tiếp tục chuyến này <ArrowRight className="w-4 h-4" />
              </button>

              {/* Other trips dropdown if exists */}
              {otherTrips.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOtherTrips(!showOtherTrips)}
                    className="text-xs font-bold opacity-75 hover:opacity-100 flex items-center justify-between w-full cursor-pointer transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>Hoặc chọn chuyến khác ({otherTrips.length})</span>
                    {showOtherTrips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showOtherTrips && (
                    <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto animate-fade-in">
                      {otherTrips.map(trip => {
                        const s = getTripStats(trip)
                        return (
                          <div
                            key={trip.id}
                            onClick={() => onContinueTrip(trip.id)}
                            style={{
                              backgroundColor: 'var(--card-bg)',
                              borderColor: 'var(--input-border)',
                            }}
                            className="p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:border-rose-600 transition-all"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold block truncate">{trip.name}</span>
                              <span className="text-[10px] opacity-70" style={{ color: 'var(--text-muted)' }}>
                                {s.memberCount} người · {formatVND(s.totalVND)}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-sky-700 shrink-0">
                              Chọn →
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OPTION 2: Create New Trip */}
          <div
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
            }}
            className="p-4 rounded-2xl border-2 space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              <PlaneTakeoff className="w-3.5 h-3.5" /> Bắt đầu chuyến đi mới
            </div>

            {!isCreating ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs opacity-75 font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Bắt đầu ghi chép chi tiêu cho một hành trình du lịch mới toanh.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-text)',
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tạo chuyến mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmCreate} className="space-y-3 animate-fade-in pt-1">
                <input
                  type="text"
                  required
                  placeholder="Tên chuyến đi (vd: Đà Lạt, Thái Lan, Hà Giang...)"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  autoFocus
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--accent)',
                    color: 'var(--text-main)',
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 focus:outline-none"
                />

                {activeTrip?.members?.length > 0 && (
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none opacity-85">
                    <input
                      type="checkbox"
                      checked={copyMembers}
                      onChange={(e) => setCopyMembers(e.target.checked)}
                      className="rounded accent-rose-600 cursor-pointer"
                    />
                    <span>Giữ lại {activeTrip.members.length} thành viên từ chuyến cũ (bỏ chọn để bắt đầu lại từ đầu)</span>
                  </label>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-text)',
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Bắt đầu chuyến đi ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer skip */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onDismiss}
            style={{ color: 'var(--text-muted)' }}
            className="text-xs font-semibold hover:underline opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            Vào thẳng ứng dụng →
          </button>
        </div>
      </div>
    </div>
  )
}
