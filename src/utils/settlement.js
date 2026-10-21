import { convertToVND, formatVND } from './currency'

/**
 * Calculates per-person statistics and computes minimum cash flow settlement transactions.
 * 
 * @param {Array} members - [{ id, name, color, bankAccount, bankName }]
 * @param {Array} expenses - [{ id, title, amount, currency, paidById, participantIds, date, category }]
 * @param {Object} rates - exchange rates map { EUR: 29020, PLN: 6620, ... }
 */
export function calculateSettlement(members, expenses, rates) {
  if (!members || members.length === 0) {
    return {
      totalSpendingVND: 0,
      averagePerPersonVND: 0,
      memberSummaries: [],
      transactions: [],
      categoryTotals: {}
    }
  }

  const memberMap = new Map()
  members.forEach(m => {
    memberMap.set(m.id, {
      ...m,
      totalPaidVND: 0,
      totalShareVND: 0,
      netBalanceVND: 0,
      paidCurrencies: {}, // { EUR: 120, PLN: 300 }
      expenseCount: 0
    })
  })

  let totalSpendingVND = 0
  const categoryTotals = {}

  expenses.forEach(exp => {
    const amountVND = convertToVND(exp.amount, exp.currency, rates)
    totalSpendingVND += amountVND

    // Track category
    const cat = exp.category || 'other'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amountVND

    // Payer credit
    const payer = memberMap.get(exp.paidById)
    if (payer) {
      payer.totalPaidVND += amountVND
      payer.paidCurrencies[exp.currency] = (payer.paidCurrencies[exp.currency] || 0) + Number(exp.amount)
      payer.expenseCount += 1
    }

    // Split debit among participants
    const participants = (exp.participantIds && exp.participantIds.length > 0)
      ? exp.participantIds
      : members.map(m => m.id)

    const splitAmount = amountVND / participants.length
    participants.forEach(pId => {
      const participant = memberMap.get(pId)
      if (participant) {
        participant.totalShareVND += splitAmount
      }
    })
  })

  // Compute Net Balance for each member
  // Net Balance > 0: Creditor (Nhận lại)
  // Net Balance < 0: Debtor (Cần trả)
  const memberSummaries = members.map(m => {
    const data = memberMap.get(m.id)
    const net = Math.round(data.totalPaidVND - data.totalShareVND)
    return {
      ...data,
      totalPaidVND: Math.round(data.totalPaidVND),
      totalShareVND: Math.round(data.totalShareVND),
      netBalanceVND: net
    }
  })

  const averagePerPersonVND = members.length > 0
    ? Math.round(totalSpendingVND / members.length)
    : 0

  // Minimum Cash Flow Algorithm
  // Separate into debtors (< 0) and creditors (> 0)
  const debtors = []
  const creditors = []

  memberSummaries.forEach(m => {
    // Round to avoid floating point imprecision
    const net = m.netBalanceVND
    if (net < -50) {
      debtors.push({ id: m.id, name: m.name, amount: -net })
    } else if (net > 50) {
      creditors.push({ id: m.id, name: m.name, amount: net })
    }
  })

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let dIndex = 0
  let cIndex = 0

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex]
    const creditor = creditors[cIndex]

    // Transfer the minimum of what debtor owes and creditor receives
    const transferAmount = Math.min(debtor.amount, creditor.amount)
    const roundedTransfer = Math.round(transferAmount)

    if (roundedTransfer > 0) {
      const creditorMember = members.find(m => m.id === creditor.id)
      const debtorMember = members.find(m => m.id === debtor.id)

      transactions.push({
        id: `tx-${debtor.id}-${creditor.id}-${transactions.length}`,
        fromId: debtor.id,
        fromName: debtor.name,
        fromMember: debtorMember,
        toId: creditor.id,
        toName: creditor.name,
        toMember: creditorMember,
        amountVND: roundedTransfer,
        isCompleted: false
      })
    }

    debtor.amount -= transferAmount
    creditor.amount -= transferAmount

    if (debtor.amount < 50) dIndex++
    if (creditor.amount < 50) cIndex++
  }

  return {
    totalSpendingVND,
    averagePerPersonVND,
    memberSummaries,
    transactions,
    categoryTotals
  }
}

/**
 * Generate formatted text summary for sharing in group chat (Zalo, Telegram, etc.)
 */
export function generateShareableReport(members, expenses, rates, calculation) {
  const { totalSpendingVND, averagePerPersonVND, memberSummaries, transactions } = calculation

  let text = `✈️ BÁO CÁO CHIA TIỀN DU LỊCH ✈️\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n`
  text += `💰 Tổng chi tiêu: ${formatVND(totalSpendingVND)}\n`
  text += `👥 Số thành viên: ${members.length} người\n`
  text += `🎯 Trung bình/người: ${formatVND(averagePerPersonVND)}\n`
  text += `📝 Tổng số khoản chi: ${expenses.length} khoản\n\n`

  text += `📊 CHI TIẾT TỪNG NGƯỜI:\n`
  memberSummaries.forEach(m => {
    let status = ''
    if (m.netBalanceVND > 0) {
      status = `✅ Được nhận: +${formatVND(m.netBalanceVND)}`
    } else if (m.netBalanceVND < 0) {
      status = `🔴 Cần chuyển: -${formatVND(Math.abs(m.netBalanceVND))}`
    } else {
      status = `⚪ Hòa vốn`
    }

    // Currencies list
    const currKeys = Object.keys(m.paidCurrencies)
    const currStr = currKeys.length > 0
      ? ` (${currKeys.map(k => `${m.paidCurrencies[k]} ${k}`).join(', ')})`
      : ''

    text += `• ${m.name}: Đã chi ${formatVND(m.totalPaidVND)}${currStr} | Cần chịu ${formatVND(m.totalShareVND)} ➔ ${status}\n`
  })

  text += `\n🔄 GỢI Ý CHUYỂN TIỀN TỐI ƯU (${transactions.length} lần chuyển):\n`
  if (transactions.length === 0) {
    text += `🎉 Tất cả đã hòa vốn! Không cần chuyển thêm tiền.`
  } else {
    transactions.forEach((tx, idx) => {
      text += `${idx + 1}. ${tx.fromName} ➔ chuyển cho ➔ ${tx.toName}: ${formatVND(tx.amountVND)}\n`
    })
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`
  text += `Ứng dụng TripSplit - Tự động quy đổi EUR, PLN, VND theo thời gian thực.`
  return text
}
