# CSS DRY Audit

Goals: reduce repetition, standardize spacing/typography, and reuse existing palette/tokens in `index.css`.

## Reusable primitives already in place

- Variables: `--bg`, `--surface`, `--border`, `--text`, `--subtle`, `--gray-*`, `--ring`, font sizes.
- Base helpers: `.card`, `.full`, `.ghost`, `.unset`, `.invisible`, `.unstyled`, `.focus-ring`, `.fade-overflow` (x/y), `details` marker tweaks.

## High-frequency patterns to unify

- Flex rows with spacing and alignment.
- Column stacks with small/medium gaps.
- Cards/panels with light border + radius (variants: default, subtle, elevated).
- Section headers: label/eyebrow + title, optional actions on the right.
- Tables with consistent padding, border and sticky header (Command, Supplier tables).
- Pills/chips for metadata (SKU, category, stock).
- Form fields: label + input with consistent padding, radius, focus ring.
- Button variants: primary, subtle/ghost with hover background, left-aligned action buttons.
- List rows: padded rows with hover background and checkbox alignment.

## Proposed shared utility classes

Define these once in `index.css` (or a new `utilities.css`) and reuse:

- Layout

  - `.flex-row { display:flex; align-items:center; gap:0.5rem; }`
  - `.flex-between { display:flex; justify-content:space-between; align-items:center; gap:0.5rem; }`
  - `.flex-col { display:flex; flex-direction:column; gap:0.5rem; }`
  - `.gap-sm { gap:0.35rem; }` `.gap-md { gap:0.75rem; }`
  - `.grid-auto-240 { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:0.75rem; }`
  - `.section-pad { padding:1rem; }`

- Cards / surfaces

  - `.card` (existing) plus modifiers: `.card-elevated { box-shadow:rgba(0,0,0,0.08) 0 6px 18px; }`, `.card-border { border:1px solid var(--border); border-radius:0.75rem; background:var(--surface); }`

- Headings / eyebrows

  - `.eyebrow` (reuse ProductSheet) move to globals; `.section-title { margin:0; font-size:1.1rem; font-weight:600; }`
  - `.section-header { display:flex; justify-content:space-between; align-items:center; gap:0.75rem; }`

- Tables

  - `.table` base: full width, `border-collapse:collapse`, bg `var(--surface)`, row bottom border `var(--border)`, cell padding `0.5rem 0.65rem`, sticky header optional.
  - `.table-striped` optional row striping using `color-mix`.
  - `.table-numeric { text-align:right; font-variant-numeric:tabular-nums; }`
  - `.table-card { border:1px solid var(--border); border-radius:1rem; overflow:hidden; }`

- Pills / chips

  - `.pill { padding:0.35rem 0.65rem; border:1px solid var(--gray-2); border-radius:999px; font-size:0.85rem; color:var(--subtle); background:var(--gray-1); }`

- Forms

  - `.field` base: column, small gap; `.field input, .field select { padding:0.55rem 0.65rem; border:1px solid var(--border); border-radius:0.5rem; background:var(--surface); }`
  - `.field input:focus-visible` with `outline:2px solid var(--ring); outline-offset:2px;`
  - `.field-span-2 { grid-column:span 2; }` for grids.

- Buttons

  - Keep `.primary`, `.subtle`, `.ghost`; add `.btn-left { justify-content:flex-start; text-align:left; width:100%; padding:0.5rem 0.75rem; }`
  - Hover helper: `.hover-ghost { background:var(--gray-1); }`

- Lists / rows
  - `.row-hover { padding:0.75rem 1rem; border-top:1px solid var(--gray-2); }` with hover bg and checkbox spacing like `#product-list`.

## Where to apply

- ProductList & SupplierInfo: replace custom flex/grid wrappers with `.section-header`, `.grid-auto-240`, `.table-card`, `.table`, `.table-numeric`, `.pill`.
- ProductSheet: move `.eyebrow`, `.pill`, `.field` to shared; reuse `.grid-auto-240` and `.field-span-2`.
- Command tables & Supplier tables: swap to `.table-card` + `.table` + `.table-numeric`.
- Filter/Popup actions: use `.btn-left` and `.flex-col.gap-md` instead of bespoke rules.
- Lists (Home/List/Product): adopt `.row-hover` + shared checkbox spacing, avoid per-list padding rules.

## Next steps (suggested order)

1. Add the proposed utilities to `index.css` (or `utilities.css`).
2. Refactor components to use utilities, removing duplicate per-file rules.
3. Trim local CSS once shared utilities cover the repeated patterns.
