import React, { useState } from 'react'
import {
  Compass,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Users,
  Receipt,
  CheckCircle2,
  Clock,
  Flag,
  Sparkles
} from 'lucide-react'
import { convertToVND, formatVND } from '../utils/currency'

export default function TripSelector({
  trips,
  activeTripId,
  rates,
  onSelectTrip,
  onCreateTrip,
  onRenameTrip,
  onDeleteTrip,
  onOpenWelcomeGateway
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTripName, setNewTripName] = useState('')
  const [copyMembers, setCopyMembers] = useState(false)
  const [editingTripId, setEditingTripId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0]

  const handleStartCreate = () => {
    setIsCreating(true)
    setNewTripName(`Chuyến đi ${trips.length + 1}`)
    setCopyMembers(false)
  }

  const handleConfirmCreate = (e) => {
    e.preventDefault()
    if (!newTripName.trim()) return

    onCreateTrip({
      name: newTripName.trim(),
      copyMembersFromActive: copyMembers
    })

    setIsCreating(false)
    setNewTripName('')
    setIsOpen(false)
  }

  const handleStartRename = (trip, e) => {
    e.stopPropagation()
    setEditingTripId(trip.id)
    setEditingName(trip.name)
  }

  const handleConfirmRename = (tripId, e) => {
    e?.stopPropagation()
    if (editingName.trim()) {
      onRenameTrip(tripId, editingName.trim())
    }
    setEditingTripId(null)
  }

  const handleDelete = (tripId, tripName, e) => {
    e.stopPropagation()
    if (trips.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 chuyến đi.')
      return
    }
    onDeleteTrip(tripId)
  }

  // Calculate quick stats for a trip
  const getTripStats = (trip) => {
    const totalVND = (trip.expenses || []).reduce((sum, exp) => {
      return sum + convertToVND(exp.amount, exp.currency, rates)
    }, 0)
    const expenseCount = trip.expenses?.length || 0
    const memberCount = trip.members?.length || 0
    return { totalVND, expenseCount, memberCount }
  }

  return (
    <>
      {/* Top Right Header Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-main)',
        }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer group min-h-[42px]"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: !activeTrip?.tripEnded
              ? '#10b981' // Green: Ongoing
              : '#f59e0b', // Amber: Ended / Settling
          }}
          title={!activeTrip?.tripEnded ? 'Chuyến đi đang diễn ra' : 'Đang chia tiền'}
        />

        <div className="flex items-center text-left">
          <span className="text-xs sm:text-sm font-bold max-w-[130px] sm:max-w-[180px] truncate leading-tight">
            {activeTrip?.name || 'Chuyến đi'}
          </span>
        </div>

        <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Trips Management Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)',
            }}
            className="rounded-3xl border-2 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)',
              }}
              className="px-5 py-4 border-b-2 flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  Chuyến đi ({trips.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsCreating(false)
                }}
                className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Trip list */}
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
              {trips.map((trip) => {
                const isActive = trip.id === activeTripId
                const isEditing = editingTripId === trip.id
                const stats = getTripStats(trip)

                return (
                  <div
                    key={trip.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectTrip(trip.id)
                        setIsOpen(false)
                      }
                    }}
                    style={{
                      backgroundColor: isActive ? 'var(--badge-bg)' : 'var(--input-bg)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--input-border)',
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs min-h-[62px] ${
                      isActive ? 'ring-2 ring-rose-400/50 shadow-xs' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Active indicator dot/check */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs"
                        style={{
                          backgroundColor: isActive ? 'var(--accent)' : 'var(--card-bg)',
                          color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                        }}
                      >
                        {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : <Compass className="w-4 h-4" />}
                      </div>

                      {/* Info & Rename */}
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmRename(trip.id, e)
                                if (e.key === 'Escape') setEditingTripId(null)
                              }}
                              autoFocus
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--accent)',
                                color: 'var(--text-main)',
                              }}
                              className="px-3 py-1.5 text-sm font-bold rounded-xl border-2 focus:outline-none w-full"
                            />
                            <button
                              type="button"
                              onClick={(e) => handleConfirmRename(trip.id, e)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTripId(null)
                              }}
                              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm sm:text-base truncate">
                                {trip.name}
                              </span>
                              {isActive && (
                                <span
                                  style={{
                                    backgroundColor: 'var(--accent)',
                                    color: 'var(--accent-text)',
                                  }}
                                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                                >
                                  Hiện tại
                                </span>
                              )}
                            </div>

                            <div className="text-xs sm:text-sm opacity-80 font-medium flex items-center gap-2.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {stats.memberCount}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> {stats.expenseCount}</span>
                              <span>·</span>
                              <span className="font-bold" style={{ color: 'var(--accent)' }}>
                                {formatVND(stats.totalVND)}
                              </span>
                              <span>·</span>
                              {!trip.tripEnded ? (
                                <Clock className="w-3.5 h-3.5 text-emerald-600" title="Đang đi" />
                              ) : (
                                <Flag className="w-3.5 h-3.5 text-rose-600" title="Chia tiền" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions: Rename / Delete */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(trip, e)}
                          title="Sửa"
                          className="w-9 h-9 rounded-xl flex items-center justify-center opacity-75 hover:opacity-100 hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {trips.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(trip.id, trip.name, e)}
                            title="Xóa"
                            className="w-9 h-9 rounded-xl flex items-center justify-center opacity-75 hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer text-stone-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Modal Footer: Create new trip */}
            <div
              style={{
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)',
              }}
              className="p-4 border-t-2 shrink-0 space-y-3"
            >
              {isCreating ? (
                <form onSubmit={handleConfirmCreate} className="space-y-3 animate-fade-in">
                  <input
                    type="text"
                    required
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    autoFocus
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--accent)',
                      color: 'var(--text-main)',
                    }}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-base font-bold rounded-2xl border-2 focus:outline-none min-h-[46px]"
                  />

                  {activeTrip?.members?.length > 0 && (
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer select-none opacity-85 py-0.5">
                      <input
                        type="checkbox"
                        checked={copyMembers}
                        onChange={(e) => setCopyMembers(e.target.checked)}
                        className="rounded accent-rose-600 cursor-pointer w-4 h-4"
                      />
                      <span>Giữ lại {activeTrip.members.length} người từ chuyến này</span>
                    </label>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-text)',
                      }}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px]"
                    >
                      <Plus className="w-4 h-4" /> Tạo chuyến
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-3 rounded-2xl text-sm font-semibold opacity-70 hover:opacity-100 cursor-pointer min-h-[48px]"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-text)',
                    }}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <Plus className="w-4 h-4" /> Tạo chuyến mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
