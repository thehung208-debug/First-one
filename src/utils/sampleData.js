// Sample trip data for a trip to Europe (Vietnam - France - Poland)
// demonstrating EUR, PLN (zl), and VND multi-currency spending.

export const SAMPLE_MEMBERS = [
  { id: 'm1', name: 'Ngọc Lan', color: '#0284c7', bankAccount: '1903678912345', bankName: 'Techcombank' },
  { id: 'm2', name: 'Đức Cường', color: '#78350f', bankAccount: '0011004567890', bankName: 'Vietcombank' },
  { id: 'm3', name: 'Minh Hải', color: '#0369a1', bankAccount: '10287654321', bankName: 'MBBank' },
  { id: 'm4', name: 'Thảo An', color: '#92400e', bankAccount: '88889999222', bankName: 'ACB' }
]

export const SAMPLE_EXPENSES = [
  {
    id: 'e1',
    title: 'Vé máy bay khứ hồi cả nhóm',
    amount: 52000000,
    currency: 'VND',
    paidById: 'm2', // Cường
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-12',
    category: 'transport'
  },
  {
    id: 'e2',
    title: 'Khách sạn tại Paris (3 đêm)',
    amount: 720,
    currency: 'EUR',
    paidById: 'm1', // Lan
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-14',
    category: 'stay'
  },
  {
    id: 'e3',
    title: 'Bữa tối ẩm thực Pháp tại Le Marais',
    amount: 195,
    currency: 'EUR',
    paidById: 'm3', // Hải
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-15',
    category: 'food'
  },
  {
    id: 'e4',
    title: 'Căn hộ Airbnb ở Kraków Ba Lan',
    amount: 1250,
    currency: 'PLN', // zł
    paidById: 'm4', // An
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-17',
    category: 'stay'
  },
  {
    id: 'e5',
    title: 'Vé tàu cao tốc PKP Intercity',
    amount: 460,
    currency: 'PLN', // zł
    paidById: 'm2', // Cường
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-18',
    category: 'transport'
  },
  {
    id: 'e6',
    title: 'Bữa trưa Pierogi truyền thống Ba Lan',
    amount: 280,
    currency: 'PLN', // zł
    paidById: 'm1', // Lan
    participantIds: ['m1', 'm2', 'm3', 'm4'],
    date: '2026-10-19',
    category: 'food'
  },
  {
    id: 'e7',
    title: 'Sim 4G Châu Âu (Lan, Cường, Hải mua)',
    amount: 75,
    currency: 'EUR',
    paidById: 'm3', // Hải
    participantIds: ['m1', 'm2', 'm3'], // An đã có sim từ trước
    date: '2026-10-13',
    category: 'other'
  }
]
