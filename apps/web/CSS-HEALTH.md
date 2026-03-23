# Bedo Fish CSS Health Reference

## Protection layers (outermost to innermost)
1. GitHub Actions — blocks broken pushes from deploying
2. Pre-commit hook — blocks broken commits (husky)
3. predev / prebuild scripts — dev server and build REFUSE to start
4. css-guard.mjs — run manually anytime: `pnpm css-guard`
5. css-repair.mjs — auto-fixes common issues: `pnpm css-repair`

## If you see unstyled HTML

Step 1: Run the repair tool
```
pnpm css-repair
```

Step 2: Run the guard to see what is still broken
```
pnpm css-guard
```

Step 3: Manually fix remaining errors

Step 4: Clear cache and restart
```
rm -rf apps/web/.next && pnpm --filter web dev
```

## Tailwind version
```
pnpm --filter web list tailwindcss
```
Current: v4.x

## File: app/globals.css
First line MUST be:
```css
@import "tailwindcss";
```
Protected: the dev server will not start if this is missing.

## File: app/layout.tsx
FIRST import MUST be:
```ts
import './globals.css'
```
Font imports: `Instrument_Serif` and `Inter` ONLY.
Font variables: `variable: '--font-heading'` and `variable: '--font-body'`
Protected: the dev server will not start if this is wrong.

## File: postcss.config.mjs
MUST contain: `'@tailwindcss/postcss': {}`
Use `.mjs` (ESM format) — NOT `.js` (CommonJS).
Protected: the dev server will not start if this is missing.

## How the predev/prebuild hooks work
In `apps/web/package.json`:
```json
"predev":   "node scripts/css-guard.mjs",
"prebuild": "node scripts/css-guard.mjs"
```
pnpm/npm runs `predev` automatically before `dev`.
If `css-guard.mjs` exits with code 1, the dev server NEVER starts.
This means broken CSS is caught the moment anyone tries to run
the app — not just on commit.

## The circular variable trap
NEVER write self-referential CSS variables in @theme:
```css
/* WRONG — crashes Tailwind v4 processing */
--font-heading: var(--font-heading), Georgia, serif;

/* CORRECT — static string */
--font-heading: 'Instrument Serif', Georgia, serif;
```
The font variables in @theme must be static strings.
Next.js font injection (variable: '--font-heading') will override
at the html element level via CSS cascade — this is expected.
