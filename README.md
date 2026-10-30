# Plantopia Frontend — Sprint1

React 18 + React Router + Create React App 5. Node 22.21.0 (`.nvmrc`).

```text
npm ci
npm test -- --watchAll=false --runInBand
npm run build
```

Set `REACT_APP_API_URL` in `.env` before building (for example http://127.0.0.1:3001 for the isolated backend). Serve `build/` using a static server with fallback to index.html. The original `npm start` is a legacy webpack development server; see SECURITY.md before using it. Do not expose it publicly or use it as a production server.

Sprint1 uses only cash orders pending collection. PayPal is deliberately unavailable until server-side capture verification and reconciliation are implemented. Cart prices/tax/shipping and quote hash come from the backend. Confirmation does not claim payment received. Receipts use saved totals including shipping and the actual payment state; they are order receipts, not fiscal invoices.

A timed-out checkout is saved in sessionStorage by account and retried with the original payload and idempotency key. A recovery button remains available even if the server already emptied the cart. Retrying that pending operation uses its original delivery address and total. Explicit validation/conflict responses permit a new operation; network errors preserve the pending one.

Admin payment detail provides an explicit cash-received confirmation. Delivery state choices match backend transitions; assignment and courier delivery have separate actions. Cancelling an eligible unpaid order updates both its payment and delivery states.

API errors are structured on the wire. The shared Axios/fetch boundary preserves errorCode and adapts message strings for existing components. Monetary strings are formatted locally for display; browser-computed totals do not determine checkout charges.

`npm run audit:check` records the full audit and fails on unexpected high/critical advisories or expired exceptions. Known legacy-tooling exceptions, restrictions and the 2026-11-12 expiry are in SECURITY.md and scripts/audit-exceptions.json. No automatic deployment is configured.

Browser-based smoke testing remains a release requirement. Automated component tests cover checkout quote display, cash-only choices, pending retry recovery and receipt content. CI performs clean install, tests, production build and the audit gate.
