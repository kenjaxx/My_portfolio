// Makes a smaller carousel copy of every certificate.
// Run: node scripts/optimize-certs.mjs
// Reads  public/images/certs/<name>-full.webp   (kept for the "View full size" viewer)
// Writes public/images/certs/<name>.webp        (used by the carousel)
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const DIR = 'public/images/certs'

// The carousel card is 680px wide, so 1000px stays sharp on most screens.
const WIDTH = 1000

const files = (await readdir(DIR)).filter((f) => /-full\.webp$/i.test(f))

if (files.length === 0) {
  console.log(`No *-full.webp files found in ${DIR}`)
  process.exit(1)
}

for (const file of files) {
  const out = path.join(DIR, file.replace(/-full\.webp$/i, '.webp'))
  const info = await sharp(path.join(DIR, file))
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(out)
  console.log(
    `${file} -> ${path.basename(out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`
  )
}