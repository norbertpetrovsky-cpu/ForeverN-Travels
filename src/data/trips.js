// ─── Module definitions ───────────────────────────────────────────────────────
export const ALL_MODULES = [
  { id: 'balenie',   label: 'Balenie',    labelFull: 'Kontrolné zoznamy', icon: '🧳' },
  { id: 'plan',      label: 'Plán',       labelFull: 'Denný plánovač',    icon: '📅' },
  { id: 'mapa',      label: 'Mapa',       labelFull: 'Interaktívna mapa', icon: '🗺️' },
  { id: 'rozpocet',  label: 'Rozpočet',   labelFull: 'Sledovač výdavkov', icon: '💰' },
  { id: 'spomienky', label: 'Spomienky',  labelFull: 'Fotoalbum',         icon: '📸' },
  { id: 'denik',     label: 'Denník',     labelFull: 'Cestovný denník',   icon: '📖' },
]

// ─── Trip status ──────────────────────────────────────────────────────────────
// 'past' | 'active' | 'planned'

// ─── Seed trip data ───────────────────────────────────────────────────────────
export const INITIAL_TRIPS = [
  {
    id: 'donovaly-2021',
    destination: 'Donovaly',
    country: 'Slovensko',
    flag: '🇸🇰',
    dateFrom: '2021-08-01',
    dateTo: '2021-08-14',
    hotel: '',
    status: 'past',
    who: 'family',
    color: '#5B8C5A',
    highlight: 'Horská dovolenka v srdci Slovenska',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'slovinsko-taliansko-2022',
    destination: 'Slovinsko & Taliansko',
    country: 'Road trip',
    flag: '🇸🇮🇮🇹',
    dateFrom: '2022-05-01',
    dateTo: '2022-05-21',
    hotel: 'Rôzne ubytovanie',
    status: 'past',
    who: 'couple',
    color: '#7B5EA7',
    highlight: 'Road trip cez Alpy — Ľubľana, Benátky, Rím',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2023',
    destination: 'Cyprus 2023',
    country: 'Cyprus · Protaras',
    flag: '🇨🇾',
    dateFrom: '2023-07-01',
    dateTo: '2023-07-14',
    hotel: 'Constantinos the Great',
    status: 'past',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Prvýkrát v Protarase — objavovanie raja',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'rim-2024',
    destination: 'Rím',
    country: 'Taliansko',
    flag: '🇮🇹',
    dateFrom: '2024-04-01',
    dateTo: '2024-04-07',
    hotel: '',
    status: 'past',
    who: 'couple',
    color: '#C17F3E',
    highlight: 'Večné mesto — história, jedlo, romantika',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2024',
    destination: 'Cyprus 2024',
    country: 'Cyprus · Protaras',
    flag: '🇨🇾',
    dateFrom: '2024-07-01',
    dateTo: '2024-07-14',
    hotel: 'Constantinos the Great',
    status: 'past',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Druhý rok v Protarase — ako doma',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2025',
    destination: 'Cyprus 2025',
    country: 'Cyprus · Protaras',
    flag: '🇨🇾',
    dateFrom: '2025-07-01',
    dateTo: '2025-07-14',
    hotel: 'Silver Sands',
    status: 'past',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Prvý rok v Silver Sands — nová obľúbená',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2026',
    destination: 'Cyprus 2026',
    country: 'Cyprus · Protaras',
    flag: '🇨🇾',
    dateFrom: '2026-07-25',
    dateTo: '2026-08-05',
    hotel: 'Silver Sands',
    status: 'active',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Štvrtý rok v Protarase — náš raj',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: true, plan: true, mapa: true, rozpocet: true, spomienky: true, denik: true },
  },
]

// ─── Bucket list seed data ────────────────────────────────────────────────────
export const INITIAL_BUCKET = [
  {
    id: 'bucket-maldives',
    destination: 'Maldivy',
    country: '🇲🇻',
    timeframe: '2027–2028',
    who: 'couple',
    notes: 'Sen — overwater bungalov',
  },
  {
    id: 'bucket-japan',
    destination: 'Japonsko',
    country: '🇯🇵',
    timeframe: '2028+',
    who: 'family',
    notes: 'Tokio, Kjóto, Fuji',
  },
  {
    id: 'bucket-norway',
    destination: 'Nórsko',
    country: '🇳🇴',
    timeframe: '2027',
    who: 'couple',
    notes: 'Fjordy a polárna žiara',
  },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────
const TRIPS_KEY  = 'fn_trips'
const BUCKET_KEY = 'fn_bucket'

export function loadTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_KEY)
    return raw ? JSON.parse(raw) : INITIAL_TRIPS
  } catch { return INITIAL_TRIPS }
}

export function saveTrips(trips) {
  try { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)) } catch {}
}

export function loadBucket() {
  try {
    const raw = localStorage.getItem(BUCKET_KEY)
    return raw ? JSON.parse(raw) : INITIAL_BUCKET
  } catch { return INITIAL_BUCKET }
}

export function saveBucket(bucket) {
  try { localStorage.setItem(BUCKET_KEY, JSON.stringify(bucket)) } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getTripStatus(trip) {
  const now  = new Date()
  const from = new Date(trip.dateFrom)
  const to   = new Date(trip.dateTo)
  if (now < from) return 'planned'
  if (now > to)   return 'past'
  return 'active'
}

export function formatDateRange(from, to) {
  const f = new Date(from)
  const t = new Date(to)
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${f.toLocaleDateString('sk-SK', opts)} – ${t.toLocaleDateString('sk-SK', opts)}`
}

export function generateId() {
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
