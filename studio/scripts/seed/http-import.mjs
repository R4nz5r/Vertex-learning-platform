import { safeImport } from './safe-import.mjs'

// Backwards-compatible proxy pointing to non-destructive safeImport
safeImport().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
