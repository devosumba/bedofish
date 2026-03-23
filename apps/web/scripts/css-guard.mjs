#!/usr/bin/env node
/**
 * Bedo Fish CSS Guard
 * Runs before dev server start and before every build.
 * If CSS config is broken, EXITS with code 1 immediately.
 * The dev server and build process will not start.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const errors = []

function file(p)   { return path.join(root, p) }
function exists(p) { return fs.existsSync(file(p)) }
function read(p)   { return exists(p) ? fs.readFileSync(file(p), 'utf8') : null }

const RED    = '\x1b[31m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'

console.log(`\n${BOLD}Bedo Fish CSS Guard${RESET}\n`)

// Guard 1: globals.css exists and has Tailwind directive
const css = read('app/globals.css')
if (!css) {
  errors.push('globals.css does not exist at apps/web/app/globals.css')
} else {
  const hasV4 = css.includes('@import "tailwindcss"') || css.includes("@import 'tailwindcss'")
  const hasV3 = css.includes('@tailwind base')
  if (!hasV4 && !hasV3) {
    errors.push(
      'globals.css is missing the Tailwind directive.\n' +
      '  Tailwind v4: add @import "tailwindcss"; as the first line\n' +
      '  Tailwind v3: add @tailwind base; @tailwind components; @tailwind utilities;'
    )
  } else {
    console.log(`  ${GREEN}checkmark${RESET} globals.css has Tailwind directive`)
  }
}

// Guard 2: globals.css is the first import in layout.tsx
const layout = read('app/layout.tsx')
if (!layout) {
  errors.push('layout.tsx does not exist at apps/web/app/layout.tsx')
} else {
  const hasCssImport =
    layout.includes("import './globals.css'") ||
    layout.includes('import "./globals.css"') ||
    layout.includes("import '@/app/globals.css'") ||
    layout.includes('import "@/app/globals.css"')

  if (!hasCssImport) {
    errors.push(
      "globals.css is not imported in layout.tsx.\n" +
      "  Add: import './globals.css'  as the FIRST line of imports."
    )
  } else {
    const lines = layout.split('\n')
    const cssLine = lines.findIndex(l => l.includes('globals.css'))
    const firstImport = lines.findIndex(l =>
      l.trim().startsWith('import') && !l.includes('globals.css'))
    if (cssLine > firstImport && firstImport !== -1) {
      errors.push(
        "globals.css is not the FIRST import in layout.tsx.\n" +
        "  Move import './globals.css' to line 1."
      )
    } else {
      console.log(`  ${GREEN}checkmark${RESET} layout.tsx imports globals.css first`)
    }
  }
}

// Guard 3: PostCSS config exists and is valid
const pcMjs = read('postcss.config.mjs')
const pcJs  = read('postcss.config.js')
const pcTs  = read('postcss.config.ts')
const pc = pcMjs || pcJs || pcTs

if (!pc) {
  errors.push(
    'No PostCSS config found.\n' +
    '  Tailwind v4: create postcss.config.mjs with @tailwindcss/postcss\n' +
    '  Tailwind v3: create postcss.config.js with tailwindcss + autoprefixer'
  )
} else if (!pc.includes('tailwindcss') && !pc.includes('@tailwindcss/postcss')) {
  errors.push(
    'PostCSS config does not reference tailwindcss.\n' +
    '  Tailwind v4: add "@tailwindcss/postcss": {}\n' +
    '  Tailwind v3: add tailwindcss: {}, autoprefixer: {}'
  )
} else {
  console.log(`  ${GREEN}checkmark${RESET} PostCSS config is valid`)
}

// Guard 4: No var() references inside @theme (the recurring crash pattern)
// This is the exact bug that broke CSS twice: --font-x: var(--font-x) inside
// @theme creates a self-referential CSS variable that empties Tailwind's output.
if (css) {
  const themeMatch = css.match(/@theme\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s)
  if (themeMatch) {
    const themeBlock = themeMatch[1]
    const varRefs = themeBlock.match(/--[\w-]+\s*:\s*[^;]*var\([^)]+\)[^;]*/g) || []
    if (varRefs.length > 0) {
      errors.push(
        'var() reference found inside @theme block — this WILL crash Tailwind v4 CSS output:\n' +
        varRefs.map(v => `  ${v.trim()}`).join('\n') + '\n' +
        '  @theme values must be static strings only.\n' +
        '  Font families belong in plain CSS classes, NOT in @theme.\n' +
        '  See: apps/web/CSS-HEALTH.md'
      )
    } else {
      console.log(`  ${GREEN}checkmark${RESET} @theme contains no var() references`)
    }
  }
}

// Guard 5a: animations.css — if imported, must exist
if (layout && (layout.includes('animations.css') || layout.includes('/animations'))) {
  const animExists =
    exists('styles/animations.css') || exists('app/animations.css')
  if (!animExists) {
    errors.push(
      'layout.tsx imports animations.css but the file does not exist.\n' +
      '  Create apps/web/styles/animations.css or remove the import.'
    )
  } else {
    console.log(`  ${GREEN}checkmark${RESET} animations.css exists`)
  }
}

// Guard 5: No conflicting old font imports
if (layout) {
  const banned = ['Playfair_Display', 'DM_Sans', 'Fraunces']
  const found = banned.filter(f => layout.includes(f))
  if (found.length > 0) {
    errors.push(
      `Old font imports found in layout.tsx: ${found.join(', ')}\n` +
      '  Remove these. Only Instrument_Serif and Inter should be imported.'
    )
  } else {
    console.log(`  ${GREEN}checkmark${RESET} No conflicting old font imports`)
  }
}

// Guard 6: Font variables applied to html element
if (layout) {
  const hasVars =
    layout.includes('instrumentSerif.variable') ||
    layout.includes('inter.variable') ||
    layout.includes('--font-heading') ||
    layout.includes('--font-body')
  if (!hasVars) {
    errors.push(
      'Font CSS variables may not be applied to the html element.\n' +
      '  Ensure: <html className={`${instrumentSerif.variable} ${inter.variable}`}>'
    )
  } else {
    console.log(`  ${GREEN}checkmark${RESET} Font variables applied in layout.tsx`)
  }
}

// Results
console.log('')
if (errors.length === 0) {
  console.log(`${GREEN}${BOLD}CSS guard passed. Safe to run.${RESET}\n`)
  process.exit(0)
} else {
  console.log(`${RED}${BOLD}CSS GUARD FAILED — CANNOT START APP${RESET}\n`)
  errors.forEach((e, i) => {
    console.log(`${RED}${BOLD}Error ${i + 1}:${RESET} ${e}\n`)
  })
  console.log(`${YELLOW}Fix all errors above, then restart.${RESET}`)
  console.log(`${YELLOW}Reference: apps/web/CSS-HEALTH.md${RESET}\n`)
  process.exit(1)
}
