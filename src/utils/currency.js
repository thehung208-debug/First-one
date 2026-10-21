// Currency definitions and real-time exchange rates against VND

export const SUPPORTED_CURRENCIES = [
  { code: 'VND', name: 'Đồng Việt Nam', symbol: '₫', flag: '🇻🇳', defaultRate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', defaultRate: 29020 },
  { code: 'PLN', name: 'Złoty Ba Lan (zl)', symbol: 'zł', flag: '🇵🇱', defaultRate: 6620 },
  { code: 'USD', name: 'Đô la Mỹ', symbol: '$', flag: '🇺🇸', defaultRate: 25450 },
  { code: 'GBP', name: 'Bảng Anh', symbol: '£', flag: '🇬🇧', defaultRate: 33500 },
  { code: 'JPY', name: 'Yên Nhật', symbol: '¥', flag: '🇯🇵', defaultRate: 168 },
  { code: 'THB', name: 'Baht Thái', symbol: '฿', flag: '🇹🇭', defaultRate: 755 },
  { code: 'SGD', name: 'Đô la Singapore', symbol: 'S$', flag: '🇸🇬', defaultRate: 19300 },
  { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', flag: '🇰🇷', defaultRate: 18.5 },
]

export const DEFAULT_RATES = {
  VND: 1,
  EUR: 29020,
  PLN: 6620,
  USD: 25450,
  GBP: 33500,
  JPY: 168,
  THB: 755,
  SGD: 19300,
  KRW: 18.5,
}

/**
 * Fetch real-time exchange rates to VND
 * Using free open API: open.er-api.com
 */
export async function fetchLiveExchangeRates() {
  try {
    // We fetch base EUR and base USD to get high precision rates
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()
    
    if (data && data.rates && data.rates.VND) {
      const usdToVnd = data.rates.VND
      const calculatedRates = { VND: 1 }

      SUPPORTED_CURRENCIES.forEach(curr => {
        if (curr.code === 'VND') return
        const usdToCurr = data.rates[curr.code]
        if (usdToCurr && usdToCurr > 0) {
          // 1 curr = (usdToVnd / usdToCurr) VND
          calculatedRates[curr.code] = Math.round((usdToVnd / usdToCurr) * 100) / 100
        } else {
          calculatedRates[curr.code] = DEFAULT_RATES[curr.code]
        }
      })

      return {
        rates: calculatedRates,
        lastUpdated: new Date().toISOString(),
        source: 'open.er-api.com (Trực tuyến)'
      }
    }
    throw new Error('Invalid rate data format')
  } catch (error) {
    console.warn('Cannot fetch live exchange rates, falling back to default:', error)
    return {
      rates: { ...DEFAULT_RATES },
      lastUpdated: new Date().toISOString(),
      source: 'Tỷ giá mặc định (Ngoại tuyến)',
      error: error.message
    }
  }
}

/**
 * Convert any amount from specified currency to VND
 */
export function convertToVND(amount, currencyCode, rates) {
  if (!amount || isNaN(amount)) return 0
  const rate = rates?.[currencyCode] || DEFAULT_RATES[currencyCode] || 1
  return Math.round(Number(amount) * rate)
}

/**
 * Format currency number in Vietnamese style (e.g. 1.250.000 ₫)
 */
export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫'
  const rounded = Math.round(amount)
  return new Intl.NumberFormat('vi-VN').format(rounded) + ' ₫'
}

/**
 * Format foreign currency (e.g. 45.50 € or 120 zł)
 */
export function formatOriginalCurrency(amount, currencyCode) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0'
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
  const symbol = currency ? currency.symbol : currencyCode
  const numStr = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2
  }).format(amount)

  if (currencyCode === 'VND') return `${numStr} ₫`
  if (currencyCode === 'EUR') return `${numStr} €`
  if (currencyCode === 'PLN') return `${numStr} zł`
  if (currencyCode === 'USD') return `$${numStr}`
  return `${numStr} ${symbol}`
}
