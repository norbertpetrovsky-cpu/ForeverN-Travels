# ForeverN Travels 🌊

Norbi · Natalita · Elizabethka — naše cesty, naše spomienky.

## Rýchly štart

```bash
npm install
npm run dev
```

Potom otvor http://localhost:5173 v prehliadači.

## Deployment (Vercel)

```bash
npm run build
# Pushni na GitHub, Vercel automaticky deployuje
```

## Štruktúra projektu

```
src/
├── pages/
│   ├── Landing/      ← Úvodná stránka s odpočtom
│   ├── Home/         ← Dashboard (krok 2)
│   ├── Balenie/      ← Kontrolné zoznamy (krok 3)
│   ├── Plan/         ← Denný plánovač (krok 4)
│   ├── Cesty/        ← Cestovný denník (krok 5)
│   ├── Rozpocet/     ← Výdavky (krok 6)
│   └── Spomienky/    ← Fotky (krok 7)
├── components/
│   └── Layout/       ← Navigácia (sidebar + bottom nav)
└── index.css         ← Globálne štýly + animácie
```

## Navigácia

Hash-based routing — funguje aj offline:
- `/#/` — Landing page
- `/#/domov` — Dashboard
- `/#/balenie` — Balenie
- `/#/plan` — Plán
- `/#/cesty` — Cesty
- `/#/rozpocet` — Rozpočet
- `/#/spomienky` — Spomienky

## Verzie

- **v1** — Shell + Landing page + Navigácia ✅
- v2 — Dashboard s živým odpočtom
- v3 — Kontrolné zoznamy (9 kategórií)
- v4 — Denný plánovač
- v5 — Cestovný denník + bucket list
- v6 — Sledovač výdavkov
- v7 — Fotoalbum
- v8 — PWA (offline + inštalovateľné)
- Fáza 2 — Firebase sync
