# OpsTrack Boil Outs — Interactive React Demo

This repository hosts the public, self-contained demo of the current OpsTrack Boil Outs React application.

The demo mirrors the user-facing production store, fryer, and leadership experiences while using an in-memory data layer. It does not connect to Firebase, Brevo, Stripe, or any production service. All visitor changes reset when the page reloads or when **Reset data** is selected.

## Demo experiences

The demo opens with an experience chooser and can be switched later from the persistent demo banner:

- **Exhibit** runs a hands-free guided walkthrough. It opens the relevant controls, fills representative demo values, performs simulated actions, and advances automatically. Visitors can pause, go back, or run the current action immediately.
- **Interactive** provides the guided, hands-on workflow. Visitors use each highlighted control themselves or select **Skip action** to continue past an action.
- **Free browse** disables the tour overlay and forced route changes so visitors can explore the complete simulated product at their own pace.

For both guided experiences, Back restores the simulated data captured when the previous step opened and reopens that step's modal or expandable control. Restart tour returns the walkthrough and its simulated data to the initial state. The tour can also be exited at any time.

## Guided tour coverage

- Store-level status cards and filters
- Individual fryer status and store-dashboard navigation
- Completed boil-out logging
- Needed flags, reasons, notes, and email behavior
- History and leader correction tools
- Leadership fryer and timing-rule management
- Email recipients and reminder settings
- Completion CSV reporting

Visitors can restart the tour or reset the simulated data at any time from the blue demo banner.

## Routes

| Route | Demo experience |
| --- | --- |
| `/store/CFA00000` | Primary store dashboard |
| `/fryer/CFA00000/:fryerId` | Interactive fryer workflow |
| `/leadership/CFA00000` | Interactive store administration |

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

The application stylesheet is included in the JavaScript bundle so the demo
cannot render without its visual system if a host or stale cache misses a
separate generated CSS asset.
