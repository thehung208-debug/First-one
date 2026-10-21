import React, { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import MemberManager from './components/MemberManager'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import SummaryCards from './components/SummaryCards'
import SettlementPlan from './components/SettlementPlan'
import { DEFAULT_RATES, fetchLiveExchangeRates } from './utils/currency'
import { calculateSettlement } from './utils/settlement'

const STORAGE_KEYS = {
  MEMBERS: 'fg_members_v1',
  EXPENSES: 'fg_expenses_v1',
  RATES: 'fg_rates_v1',
  COMPLETED_TXS: 'fg_completed_txs_v1',
}

export default function App() {
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [rates, setRates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATES)
      return saved ? JSON.parse(saved) : DEFAULT_RATES
    } catch { return DEFAULT_RATES }
  })

  const [completedTxIds, setCompletedTxIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_TXS)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [editingExpense, setEditingExpense] = useState(null)
  const [tripEnded, setTripEnded] = useState(false)

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)) }, [members])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates)) }, [rates])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMPLETED_TXS, JSON.stringify(completedTxIds)) }, [completedTxIds])

  // Fetch live rates silently on mount
  useEffect(() => {
    fetchLiveExchangeRates().then(result => {
      if (result?.rates) setRates(result.rates)
    })
  }, [])

  const calculation = useMemo(() => calculateSettlement(members, expenses, rates), [members, expenses, rates])

  // Handlers
  const handleAddMember = (m) => setMembers(prev => [...prev, m])
  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
    setExpenses(prev => prev.filter(e => e.paidById !== id).map(e => ({
      ...e, participantIds: (e.participantIds || []).filter(p => p !== id)
    })))
  }
  const handleUpdateMember = (id, updates) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))

  const handleAddExpense = (exp) => setExpenses(prev => [exp, ...prev])
  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    if (editingExpense?.id === id) setEditingExpense(null)
  }
  const handleUpdateExpense = (id, updates) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))

  const handleToggleCompleteTx = (txId) => {
    setCompletedTxIds(prev => prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId])
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between antialiased selection:bg-amber-200 selection:text-amber-950">
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
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/forrest.png"
                alt="Forrest Gump"
                style={{ borderColor: 'var(--accent)' }}
                className="w-11 h-11 rounded-xl object-cover shadow-sm border-2 rotate-[-2deg]"
              />
              <div>
                <h1
                  style={{ color: 'var(--accent)' }}
                  className="text-xl sm:text-2xl font-black tracking-tight leading-tight"
                >
                  Forrest <span>Gump</span>
                </h1>
                <p className="text-[11px] font-semibold opacity-75" style={{ color: 'var(--text-muted)' }}>
                  Sổ tay chia tiền du lịch
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-2xl mx-auto px-4 pt-4 pb-12 space-y-4">
          {/* Members section */}
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
              className="text-xs font-black uppercase tracking-wider"
            >
              Thành viên ({members.length})
            </span>
            <MemberManager
              members={members}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateMember={handleUpdateMember}
            />
          </section>

          {/* Add / Edit Expense Form */}
          <ExpenseForm
            members={members}
            rates={rates}
            onAddExpense={handleAddExpense}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
            onUpdateExpense={handleUpdateExpense}
          />

          {/* Overview: Total group spending */}
          <SummaryCards calculation={calculation} />

          {/* End Trip button & Settlement Plan */}
          <SettlementPlan
            calculation={calculation}
            completedTxIds={completedTxIds}
            onToggleCompleteTx={handleToggleCompleteTx}
            tripEnded={tripEnded}
            onEndTrip={() => setTripEnded(prev => !prev)}
          />

          {/* Expense history */}
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
                className="text-xs font-black uppercase tracking-wider"
              >
                Lịch sử chi tiêu ({expenses.length})
              </span>
              <ExpenseList
                expenses={expenses}
                members={members}
                rates={rates}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={(exp) => {
                  setEditingExpense(exp)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
