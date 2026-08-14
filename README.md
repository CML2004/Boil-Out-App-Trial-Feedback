# OpsTrack Boil Outs — Interactive React Demo

This repository hosts the public, self-contained demo of the current OpsTrack Boil Outs React application.

The demo mirrors the production store, fryer, leadership, and development experiences while using an in-memory data layer. It does not connect to Firebase, Brevo, Stripe, or any production service. All visitor changes reset when the page reloads or when **Reset data** is selected.

## Guided tour

The tour starts automatically whenever the demo loads. It can auto-play through the complete workflow or be controlled with Next, Back, Pause, and Skip. It covers:

- Store-level status cards and filters
- Individual fryer status and NFC-oriented navigation
- Completed boil-out logging
- Needed flags, reasons, notes, and email behavior
- History and leader correction tools
- Leadership fryer and timing-rule management
- Email recipients and reminder settings
- Completion CSV reporting
- Development rollout, usage, nickname, trial, and email controls

Visitors can restart the tour or reset the simulated data at any time from the blue demo banner.

## Routes

| Route | Demo experience |
| --- | --- |
| `/store/CFA02851` | Primary store dashboard |
| `/fryer/CFA02851/:fryerId` | Interactive fryer workflow |
| `/leadership/CFA02851` | Interactive store administration |
| `/development` | Interactive cross-store administration |

Legacy `index.html`, `fryer.html`, and `leadership-dashboard.html` URLs redirect into the React routes.

## Local development

Requirements: Node.js 20+ and pnpm 11+.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Verification:

```bash
pnpm test
pnpm build
```

## Cloudflare Pages

- Root directory: repository root
- Build command: `pnpm build`
- Build output directory: `dist`
- Environment variables: none required

The `public/_redirects` rule preserves client-side routing on direct links and page refreshes.
