# Revelio Website Clone

Next.js rebuild of the Revelio Labs marketing site (https://www.reveliolabs.app), originally built in Framer.

## How it works

- `scripts/import-framer.mjs` takes Framer's server-rendered HTML (desktop, tablet and phone layouts),
  strips Framer's runtime and analytics, self-hosts fonts and images in `public/assets`, and writes
  the CSS and markup to `site/generated/`.
- `app/page.tsx` renders that markup statically.
- `app/site-runtime.tsx` and `site/runtime/` reproduce the animations without Framer's JavaScript:
  scroll reveals, the hero scroll effect, the 48-Hour Framework diagram, hover states and the contact form.
- `app/policy-updates.tsx` is the "One-Click Policy Updates" widget as a React component.
- `app/api/contact/route.ts` receives the contact form and forwards it to `CONTACT_WEBHOOK_URL`.

## Development

```bash
npm install
npm run dev
```

## Updating from Framer

After publishing changes in Framer, re-import and rebuild:

```bash
node scripts/import-framer.mjs
npm run build
```

If the importer warns about a missing SVG symbol, capture it from the live page into `site/svg-symbols.html`.

## Environment

| Variable | Purpose |
| --- | --- |
| `CONTACT_WEBHOOK_URL` | Webhook (Slack, Zapier, Make, Formspree, ...) that receives contact form submissions as JSON. Without it the form shows an error. |
