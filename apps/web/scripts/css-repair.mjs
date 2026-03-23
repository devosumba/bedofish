#!/usr/bin/env node
/**
 * Bedo Fish CSS Auto-Repair
 * Attempts to fix common CSS pipeline issues automatically.
 * Run: node scripts/css-repair.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
let fixed = 0

function file(p) { return path.join(root, p) }
function read(p) {
  try { return fs.readFileSync(file(p), 'utf8') } catch { return null }
}
function write(p, content) { fs.writeFileSync(file(p), content, 'utf8') }

console.log('\nBedo Fish CSS Auto-Repair\n')

// Repair 1: Add globals.css import if missing from layout.tsx
const layout = read('app/layout.tsx')
if (layout) {
  const hasCss = layout.includes('globals.css')
  if (!hasCss) {
    const repaired = "import './globals.css'\n" + layout
    write('app/layout.tsx', repaired)
    console.log("  Fixed: Added import './globals.css' to layout.tsx")
    fixed++
  } else {
    // Ensure it is first
    const lines = layout.split('\n')
    const cssLine = lines.findIndex(l => l.includes('globals.css'))
    const firstImport = lines.findIndex(l =>
      l.trim().startsWith('import') && !l.includes('globals.css'))

    if (cssLine > firstImport && firstImport !== -1) {
      const cssImportText = lines[cssLine]
      const withoutCss = lines.filter((_, i) => i !== cssLine)
      const reordered = [
        ...withoutCss.slice(0, firstImport),
        cssImportText,
        ...withoutCss.slice(firstImport),
      ].join('\n')
      write('app/layout.tsx', reordered)
      console.log('  Fixed: Moved globals.css import to be first in layout.tsx')
      fixed++
    }
  }
}

// Repair 2: Remove banned old font imports
const layoutNow = read('app/layout.tsx')
if (layoutNow) {
  const banned = ['Playfair_Display', 'DM_Sans', 'Fraunces']
  let cleaned = layoutNow
  let removedAny = false
  for (const font of banned) {
    if (cleaned.includes(font)) {
      cleaned = cleaned.split('\n')
        .filter(l => !l.includes(font))
        .join('\n')
      removedAny = true
    }
  }
  if (removedAny) {
    write('app/layout.tsx', cleaned)
    console.log('  Fixed: Removed old font imports from layout.tsx')
    fixed++
  }
}

if (fixed === 0) {
  console.log('  No auto-fixable issues found.')
  console.log('  Run: node scripts/css-guard.mjs to see detailed errors.\n')
} else {
  console.log(`\n  ${fixed} issue(s) auto-fixed.`)
  console.log('  Run: node scripts/css-guard.mjs to verify.\n')
}
