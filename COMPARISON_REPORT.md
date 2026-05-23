# Lovable Alignment — Comparison Report
**Branch:** `claude/sprint-10-completion-I9Nj9`
**Commit:** `a2dbc7b`
**Data:** 22 maggio 2026

---

## Stato prerequisiti

| Prerequisito | Stato |
|---|---|
| `/tmp/lovable-source` (sorgente Lovable) | ❌ Non disponibile — il container remoto non persiste file tra sessioni |
| Fasi 1, 3, 4 (estrazione token, copia componenti, merge data) | ⏸ Sospese — richiedono il sorgente |
| Fasi 2, 5 (CSS + innovazioni tecniche) | ✅ Completate |

---

## File modificati

| File | Tipo | Descrizione |
|---|---|---|
| `src/index.css` | Modificato | +scroll-behavior smooth, +4 nuove classi |
| `src/components/Layout.tsx` | Modificato | +magnetic cursor desktop |
| `src/pages/ItinerariPage.tsx` | Modificato | +localStorage autosave wizard |

---

## CSS — Nuove classi aggiunte (non distruttive)

### `html { scroll-behavior: smooth }`
Era `auto`. Ora smooth con fallback `auto` per `prefers-reduced-motion`.

### `.glass-premium`
Vetro più raffinato rispetto al `.glass` esistente:
- `backdrop-filter: blur(20px) saturate(1.4)` — più profondo + più caldo
- `inset 0 0 0 0.5px rgba(255,255,255,0.6)` — highlight interno sottile

### `.gold-hover`
Hover universale riutilizzabile su qualunque card/bordo:
- `transform: translateY(-2px)` — elevazione al passaggio
- `box-shadow: 0 12px 24px -12px rgba(197,160,89,0.22)` — ombra direzionale oro

### `.stagger-item` / `.stagger-item.visible`
Controllo via IntersectionObserver: opacità 0 + translateY(20px) → 1 + translateY(0).
Usa le stesse easing silk del design system esistente (0.55s).

### `.shimmer-gold`
Alternativa a `.text-shimmer` già presente — ottimizzata per testo piccolo (badge, label):
- Gradiente 5-stop per shimmer più naturale
- 2.5s loop (leggermente più lento = più luxury)

---

## Layout.tsx — Magnetic cursor

**Solo desktop** (`window.matchMedia('(hover: none)')`), disattivato in silence mode.

Architettura:
```
mousemove → mousePos.current (immediato)
RAF loop  → ringPos.current lerp 12% verso mousePos
          → dot segue mousePos direttamente (nessun ritardo)
```

Comportamento su hover di link/button:
- Dot: 6px → 12px
- Ring: 32px → 48px + bordo più visibile

Cleanup: `removeEventListener` + `cancelAnimationFrame` su unmount.

I due elementi DOM (`.cursor-dot`, `.cursor-ring`) usano le classi CSS già presenti in `index.css` dal commit precedente.

---

## ItinerariPage.tsx — Autosave wizard

**Prima:** stato salvato solo nell'URL (`?it=base64`).

**Dopo:**
- `useEffect([state])` → `localStorage.setItem('theclass_itinerario_draft', JSON.stringify(state))` ad ogni modifica
- Mount: controlla URL → se assente, ripristina da localStorage con toast "Bozza ripristinata"
- Chiave: `theclass_itinerario_draft` (coerente con la naming convention del progetto)

---

## Funzionalità preservate

| Funzionalità | Stato |
|---|---|
| Factotum personale (tre tab) | ✅ Invariato |
| `useFactotum.ts` + 16 scadenze fiscali | ✅ Invariato |
| ConciergePage — Richieste / Promemoria / Fiscale | ✅ Invariato |
| Export ICS + Google Calendar | ✅ Invariato |
| Lenis + GSAP ScrollTrigger sync (`src/lib/scroll.ts`) | ✅ Invariato |
| Dark mode, multi-lingua, multi-valuta | ✅ Invariato |
| AIConcierge, BackToTop, ScrollProgressBar | ✅ Invariato |
| Tutti i localStorage (`theclass_concierge`, `theclass_factotum`, ecc.) | ✅ Invariato |

---

## Build

```
npm run build → ✓ built in 2.16s
TypeScript: zero errori · 4066 moduli
```

---

## Azioni manuali richieste

### Per completare le Fasi 1, 3, 4 (allineamento visivo completo con Lovable)

Hai bisogno di portare il codice sorgente Lovable nel container. Tre opzioni:

**A — GitHub export da Lovable:**
```bash
# Da terminale locale o in chat:
git clone https://github.com/<tuo-utente>/<repo-lovable> /tmp/lovable-source
```
Poi dimmi "sorgente pronto" e completo il confronto.

**B — ZIP upload:**
Carica il file ZIP tramite il pulsante 📎 in chat. Lo estraggo in `/tmp/lovable-source`.

**C — Screenshot della preview:**
Incolla qui screenshot di `preview--itsclass.lovable.app`. Implemento le sezioni mancanti a mano.

---

## Prossime classi pronte da usare

Queste classi sono ora disponibili da applicare manualmente ai componenti:

```html
<!-- Card con hover oro -->
<div class="border border-[rgba(197,160,89,0.18)] gold-hover rounded-2xl">

<!-- Badge animato -->
<span class="shimmer-gold text-xs font-medium">Verificato</span>

<!-- Vetro premium (header, modal) -->
<div class="glass-premium rounded-2xl p-6">

<!-- Card con stagger (da attivare con IntersectionObserver) -->
<div class="stagger-item">...</div>
```

---

*Report generato da Claude Code · the Class Luxury Platform*
