import React, { useState } from 'react'
import {
  Plus,
  ArrowRight,
  Clock,
  Flag,
  Users,
  Receipt,
  ChevronDown,
  ChevronUp,
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

  const handleConfirmCreate = (e) => {
    e.preventDefault()
    const name = newTripName.trim() || `Chuyến đi ${trips.length + 1}`
    onCreateNewTrip({
      name,
      copyMembersFromActive: copyMembers
    })
  }

  const activeStats = activeTrip ? getTripStats(activeTrip) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="relative w-full max-w-sm rounded-3xl border-2 shadow-2xl p-5 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          style={{ color: 'var(--text-muted)' }}
          className="absolute top-4 right-4 p-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <img
            src="/forrest.png"
            alt="Forrest Gump"
            style={{ borderColor: 'var(--accent)' }}
            className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 rotate-[-2deg] mx-auto"
          />
          <h2
            style={{ color: 'var(--accent)' }}
            className="text-xl sm:text-2xl font-black tracking-tight"
          >
            Forrest Gump
          </h2>
        </div>

        {/* Active Trip Card */}
        {activeTrip && (
          <div
            style={{
              backgroundColor: 'var(--badge-bg)',
              borderColor: 'var(--card-border)',
            }}
            className="p-3.5 rounded-2xl border-2 space-y-2.5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Luggage className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <h3 className="font-bold text-sm truncate">
                  {activeTrip.name}
                </h3>
              </div>
              {!activeTrip.tripEnded ? (
                <span className="p-1 rounded-md text-emerald-700 bg-emerald-500/15" title="Đang diễn ra">
                  <Clock className="w-3 h-3" />
                </span>
              ) : (
                <span className="p-1 rounded-md text-rose-700 bg-rose-500/15" title="Đang chia tiền">
                  <Flag className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Stats with icons */}
            <div className="flex items-center gap-3 text-xs opacity-80" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {activeStats.memberCount}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> {activeStats.expenseCount}
              </span>
              <span>·</span>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>
                {formatVND(activeStats.totalVND)}
              </span>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={() => onContinueTrip(activeTrip.id)}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
              }}
              className="w-full py-2 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Other trips dropdown if exists */}
            {otherTrips.length > 0 && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowOtherTrips(!showOtherTrips)}
                  className="text-xs font-bold opacity-70 hover:opacity-100 flex items-center justify-between w-full cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>({otherTrips.length})</span>
                  {showOtherTrips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showOtherTrips && (
                  <div className="space-y-1 pt-1.5 max-h-32 overflow-y-auto animate-fade-in">
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
                          className="p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:border-rose-600 transition-all"
                        >
                          <span className="font-bold truncate pr-2">{trip.name}</span>
                          <span className="text-[11px] font-bold text-sky-700 shrink-0">
                            {formatVND(s.totalVND)} →
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

        {/* Create New Trip Compact Form */}
        <form onSubmit={handleConfirmCreate} className="space-y-2">
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Tên chuyến mới..."
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-main)',
              }}
              className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border-2 focus:outline-none"
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center shrink-0"
              title="Tạo chuyến mới"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {activeTrip?.members?.length > 0 && (
            <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer select-none opacity-80">
              <input
                type="checkbox"
                checked={copyMembers}
                onChange={(e) => setCopyMembers(e.target.checked)}
                className="rounded accent-rose-600 cursor-pointer"
              />
              <Users className="w-3 h-3" />
              <span>{activeTrip.members.length}</span>
            </label>
          )}
        </form>
      </div>
    </div>
  )
}
