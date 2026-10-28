import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Users, Receipt } from 'lucide-react'
import Header from './components/Header'
import MemberManager from './components/MemberManager'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCards from './components/SummaryCards'
import SettlementPlan from './components/SettlementPlan'
import TripSelector from './components/TripSelector'
import WelcomeGateway from './components/WelcomeGateway'
import ConfirmModal from './components/ConfirmModal'
import { DEFAULT_RATES, fetchLiveExchangeRates, convertToVND, formatVND } from './utils/currency'
import { calculateSettlement } from './utils/settlement'

const STORAGE_KEYS = {
  TRIPS: 'fg_trips_v2',
  ACTIVE_TRIP_ID: 'fg_active_trip_id_v2',
  RATES: 'fg_rates_v1',
  LEGACY_MEMBERS: 'fg_members_v1',
  LEGACY_EXPENSES: 'fg_expenses_v1',
  LEGACY_COMPLETED_TXS: 'fg_completed_txs_v1',
}

export default function App() {
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }

      // Seamless migration from legacy data
      const legacyMembers = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_MEMBERS) || '[]')
      const legacyExpenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_EXPENSES) || '[]')
      const legacyCompleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEGACY_COMPLETED_TXS) || '[]')

      const initialTrip = {
        id: `trip_${Date.now()}`,
        name: 'Chuyến đi 1',
        createdAt: new Date().toISOString(),
        members: legacyMembers.length > 0 ? legacyMembers : [],
        expenses: legacyExpenses || [],
        completedTxIds: legacyCompleted || [],
        tripEnded: false
      }
      return [initialTrip]
    } catch {
      return [{
        id: `trip_${Date.now()}`,
        name: 'Chuyến đi 1',
        createdAt: new Date().toISOString(),
        members: [],
        expenses: [],
        completedTxIds: [],
        tripEnded: false
      }]
    }
  })

  const [activeTripId, setActiveTripId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID)
      return saved || trips[0]?.id || ''
    } catch {
      return trips[0]?.id || ''
    }
  })

  const [rates, setRates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATES)
      return saved ? JSON.parse(saved) : DEFAULT_RATES
    } catch { return DEFAULT_RATES }
  })

  const [editingExpense, setEditingExpense] = useState(null)
  const [isFormHighlighted, setIsFormHighlighted] = useState(false)
  const [recentlyRecalculated, setRecentlyRecalculated] = useState(false)
  const [showWelcomeGateway, setShowWelcomeGateway] = useState(true)
  const [confirmConfig, setConfirmConfig] = useState(null)

  const formRef = useRef(null)
  const titleInputRef = useRef(null)

  // Derive active trip and properties
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || {
    id: 'default',
    name: 'Chuyến đi 1',
    members: [],
    expenses: [],
    completedTxIds: [],
    tripEnded: false
  }

  const members = activeTrip.members || []
  const expenses = activeTrip.expenses || []
  const completedTxIds = activeTrip.completedTxIds || []
  const tripEnded = Boolean(activeTrip.tripEnded)

  // Persist trips & active trip id
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips))
  }, [trips])

  useEffect(() => {
    if (activeTrip?.id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, activeTrip.id)
    }
  }, [activeTrip?.id])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates))
  }, [rates])

  // Fetch live rates silently on mount
  useEffect(() => {
    fetchLiveExchangeRates().then(result => {
      if (result?.rates) setRates(result.rates)
    })
  }, [])

  // Helper to update active trip
  const updateActiveTrip = (updater) => {
    setTrips(prev => prev.map(t => {
      if (t.id === activeTrip.id) {
        return updater(t)
      }
      return t
    }))
  }

  const calculation = useMemo(() => calculateSettlement(members, expenses, rates), [members, expenses, rates])

  const handleTriggerAddExpense = () => {
    // Nếu muốn nạp thêm tiền thì tự động coi như đang đi tiếp
    if (tripEnded) {
      updateActiveTrip(t => ({ ...t, tripEnded: false }))
    }
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setIsFormHighlighted(true)
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 350)
      setTimeout(() => {
        setIsFormHighlighted(false)
      }, 2000)
    }, 50)
  }

  // Handlers for active trip
  const handleAddMember = (m) => updateActiveTrip(t => ({ ...t, members: [...t.members, m] }))

  const handleRemoveMember = (id) => {
    const member = members.find(m => m.id === id)
    if (!member) return
    const expCount = expenses.filter(e => e.paidById === id).length
    setConfirmConfig({
      title: 'Xoá thành viên?',
      message: expCount > 0
        ? `Xoá "${member.name}" sẽ xoá luôn ${expCount} khoản chi do người này chi trả.`
        : `Xoá "${member.name}" khỏi danh sách thành viên.`,
      confirmText: 'Xoá',
      isDanger: true,
      onConfirm: () => {
        updateActiveTrip(t => ({
          ...t,
          members: t.members.filter(m => m.id !== id),
          expenses: t.expenses.filter(e => e.paidById !== id).map(e => ({
            ...e,
            participantIds: (e.participantIds || []).filter(p => p !== id)
          }))
        }))
        setConfirmConfig(null)
      }
    })
  }

  const handleUpdateMember = (id, updates) => {
    updateActiveTrip(t => ({
      ...t,
      members: t.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }))
  }

  const handleAddExpense = (exp) => {
    // Nạp thêm chi tiêu: tự động coi như đang đi tiếp (tripEnded: false)
    updateActiveTrip(t => ({
      ...t,
      expenses: [exp, ...t.expenses],
      tripEnded: false
    }))
    setRecentlyRecalculated(false)
  }

  const handleDeleteExpense = (id) => {
    const exp = expenses.find(e => e.id === id)
    if (!exp) return
    const formattedAmount = formatVND(convertToVND(exp.amount, exp.currency, rates))
    setConfirmConfig({
      title: 'Xoá khoản chi?',
      message: `Xoá khoản "${exp.title}" (${formattedAmount}) khỏi danh sách chi tiêu.`,
      confirmText: 'Xoá',
      isDanger: true,
      onConfirm: () => {
        updateActiveTrip(t => ({ ...t, expenses: t.expenses.filter(e => e.id !== id) }))
        if (editingExpense?.id === id) setEditingExpense(null)
        if (tripEnded) setRecentlyRecalculated(true)
        setConfirmConfig(null)
      }
    })
  }

  const handleUpdateExpense = (id, updates) => {
    updateActiveTrip(t => ({
      ...t,
      expenses: t.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
    if (tripEnded) {
      setRecentlyRecalculated(true)
      setTimeout(() => {
        const el = document.getElementById('settlement-plan-section')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 350)
    }
  }

  const handleToggleCompleteTx = (txId) => {
    updateActiveTrip(t => ({
      ...t,
      completedTxIds: t.completedTxIds.includes(txId)
        ? t.completedTxIds.filter(id => id !== txId)
        : [...t.completedTxIds, txId]
    }))
  }

  const executeToggleEndTrip = () => {
    updateActiveTrip(t => {
      const nextTripEnded = !t.tripEnded
      if (nextTripEnded) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 50)
      }
      return { ...t, tripEnded: nextTripEnded }
    })
  }

  const handleToggleEndTrip = () => {
    if (!tripEnded) {
      setConfirmConfig({
        title: 'Tính tiền chuyến đi?',
        message: 'Hệ thống sẽ chốt sổ chi tiêu và tính toán chuyển khoản giữa các thành viên.',
        confirmText: 'Tính tiền',
        isDanger: false,
        onConfirm: () => {
          executeToggleEndTrip()
          setConfirmConfig(null)
        }
      })
    } else {
      executeToggleEndTrip()
    }
  }

  // Trip management operations
  const handleSelectTrip = (tripId) => {
    setActiveTripId(tripId)
    setEditingExpense(null)
    setRecentlyRecalculated(false)
  }

  const handleCreateTrip = ({ name, copyMembersFromActive }) => {
    const newId = `trip_${Date.now()}`
    const membersToUse = copyMembersFromActive && activeTrip?.members?.length > 0
      ? activeTrip.members.map(m => ({ ...m }))
      : [] // Bắt đầu lại từ đầu: hoàn toàn trống, không thêm thành viên mặc định

    const newTrip = {
      id: newId,
      name,
      createdAt: new Date().toISOString(),
      members: membersToUse,
      expenses: [],
      completedTxIds: [],
      tripEnded: false
    }

    setTrips(prev => [newTrip, ...prev])
    setActiveTripId(newId)
    setEditingExpense(null)
    setRecentlyRecalculated(false)
  }

  const handleRenameTrip = (tripId, newName) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, name: newName } : t))
  }

  const handleDeleteTrip = (tripId) => {
    if (trips.length <= 1) return
    const trip = trips.find(t => t.id === tripId)
    setConfirmConfig({
      title: 'Xoá chuyến đi?',
      message: `Chuyến đi "${trip?.name || 'này'}" và toàn bộ dữ liệu sẽ bị xoá vĩnh viễn.`,
      confirmText: 'Xoá',
      isDanger: true,
      onConfirm: () => {
        setTrips(prev => {
          const remaining = prev.filter(t => t.id !== tripId)
          if (activeTripId === tripId && remaining.length > 0) {
            setActiveTripId(remaining[0].id)
          }
          return remaining
        })
        setConfirmConfig(null)
      }
    })
  }

  const handleContinueTrip = (tripId) => {
    setActiveTripId(tripId)
    setShowWelcomeGateway(false)
    setEditingExpense(null)
  }

  const handleCreateNewTripFromGateway = ({ name, copyMembersFromActive }) => {
    handleCreateTrip({ name, copyMembersFromActive })
    setShowWelcomeGateway(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between antialiased selection:bg-rose-200 selection:text-rose-950">
      {/* Background layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-contain bg-top sm:bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      />
      {/* Soft warm latte overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundColor: 'var(--app-bg)' }}
      />

      {/* Main app content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--header-bg)',
            borderColor: 'var(--header-border)',
            color: 'var(--text-main)',
          }}
          className="sticky top-0 z-30 border-b-2 shadow-xs"
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <img
                src="/forrest.png"
                alt="Forrest Gump"
                style={{ borderColor: 'var(--accent)' }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-sm border-2 rotate-[-2deg] shrink-0"
              />
              <div className="min-w-0">
                <h1
                  style={{ color: 'var(--accent)' }}
                  className="text-lg sm:text-2xl font-black tracking-tight leading-tight truncate"
                >
                  Forrest <span>Gump</span>
                </h1>
              </div>
            </div>

            {/* Trip Selector on Top Right */}
            <TripSelector
              trips={trips}
              activeTripId={activeTrip?.id || activeTripId}
              rates={rates}
              onSelectTrip={handleSelectTrip}
              onCreateTrip={handleCreateTrip}
              onRenameTrip={handleRenameTrip}
              onDeleteTrip={handleDeleteTrip}
              onOpenWelcomeGateway={() => setShowWelcomeGateway(true)}
            />
          </div>
        </header>

        <main className="w-full max-w-2xl mx-auto px-4 pt-4 pb-12 space-y-4">
          {tripEnded ? (
            <>
              {/* 1. GỢI Ý CHUYỂN TIỀN ĐƯỢC ĐƯA LÊN ĐẦU TIÊN KHI KẾT THÚC CHUYẾN ĐI */}
              <SettlementPlan
                calculation={calculation}
                completedTxIds={completedTxIds}
                onToggleCompleteTx={handleToggleCompleteTx}
                tripEnded={tripEnded}
                onEndTrip={handleToggleEndTrip}
                onTriggerAddExpense={handleTriggerAddExpense}
                recentlyRecalculated={recentlyRecalculated}
                onDismissRecalculated={() => setRecentlyRecalculated(false)}
              />

              {/* 2. Tổng quan chi tiêu */}
              <SummaryCards calculation={calculation} />

              {/* 3. Lịch sử chi tiêu */}
              {expenses.length > 0 && (
                <section
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-main)',
                  }}
                  className="rounded-2xl p-4 border-2 space-y-2.5 shadow-sm"
                >
                  <span
                    style={{ color: 'var(--accent)' }}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{expenses.length}</span>
                  </span>
                  <ExpenseList
                    expenses={expenses}
                    members={members}
                    rates={rates}
                    onDeleteExpense={handleDeleteExpense}
                    onEditExpense={(exp) => {
                      setEditingExpense(exp)
                      handleTriggerAddExpense()
                    }}
                  />
                </section>
              )}

              {/* 4. Form bổ sung chi tiêu (nếu còn nội dung chưa nhập) */}
              <ExpenseForm
                key={activeTrip?.id || activeTripId}
                members={members}
                rates={rates}
                onAddExpense={handleAddExpense}
                editingExpense={editingExpense}
                onCancelEdit={() => setEditingExpense(null)}
                onUpdateExpense={handleUpdateExpense}
                tripEnded={tripEnded}
                isHighlighted={isFormHighlighted}
                formRef={formRef}
                titleInputRef={titleInputRef}
              />

              {/* 5. Thành viên */}
              <section
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)',
                }}
                className="rounded-2xl px-4 py-3.5 border-2 space-y-2 shadow-sm opacity-90"
              >
                <span
                  style={{ color: 'var(--accent)' }}
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>{members.length}</span>
                </span>
                <MemberManager
                  members={members}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  onUpdateMember={handleUpdateMember}
                />
              </section>
            </>
          ) : (
            <>
              {/* KHI CHUYẾN ĐI ĐANG DIỄN RA */}
              {/* 1. Thành viên */}
              <section
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)',
                }}
                className="rounded-2xl px-4 py-3.5 border-2 space-y-2 shadow-sm"
              >
                <span
                  style={{ color: 'var(--accent)' }}
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>{members.length}</span>
                </span>
                <MemberManager
                  members={members}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  onUpdateMember={handleUpdateMember}
                />
              </section>

              {/* 2. Add / Edit Expense Form */}
              <ExpenseForm
                key={activeTrip?.id || activeTripId}
                members={members}
                rates={rates}
                onAddExpense={handleAddExpense}
                editingExpense={editingExpense}
                onCancelEdit={() => setEditingExpense(null)}
                onUpdateExpense={handleUpdateExpense}
                tripEnded={tripEnded}
                isHighlighted={isFormHighlighted}
                formRef={formRef}
                titleInputRef={titleInputRef}
              />

              {/* 3. Overview: Total group spending */}
              <SummaryCards calculation={calculation} />

              {/* 4. End Trip button */}
              <SettlementPlan
                calculation={calculation}
                completedTxIds={completedTxIds}
                onToggleCompleteTx={handleToggleCompleteTx}
                tripEnded={tripEnded}
                onEndTrip={handleToggleEndTrip}
                onTriggerAddExpense={handleTriggerAddExpense}
                recentlyRecalculated={recentlyRecalculated}
                onDismissRecalculated={() => setRecentlyRecalculated(false)}
              />

              {/* 5. Expense history */}
              {expenses.length > 0 && (
                <section
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-main)',
                  }}
                  className="rounded-2xl p-4 border-2 space-y-2.5 shadow-sm"
                >
                  <span
                    style={{ color: 'var(--accent)' }}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{expenses.length}</span>
                  </span>
                  <ExpenseList
                    expenses={expenses}
                    members={members}
                    rates={rates}
                    onDeleteExpense={handleDeleteExpense}
                    onEditExpense={(exp) => {
                      setEditingExpense(exp)
                      handleTriggerAddExpense()
                    }}
                  />
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Welcome / Trip Choice Gateway on First Visit */}
      {showWelcomeGateway && (
        <WelcomeGateway
          trips={trips}
          activeTripId={activeTrip?.id || activeTripId}
          rates={rates}
          onContinueTrip={handleContinueTrip}
          onCreateNewTrip={handleCreateNewTripFromGateway}
          onDismiss={() => setShowWelcomeGateway(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        confirmText={confirmConfig?.confirmText}
        cancelText="Hủy"
        isDanger={confirmConfig?.isDanger}
        onConfirm={confirmConfig?.onConfirm}
        onCancel={() => setConfirmConfig(null)}
      />
    </div>
  )
}
