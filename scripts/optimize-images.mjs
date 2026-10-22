// Converts everything in public/images to WebP at sensible sizes.
// Run: npm run optimize:images   (originals are left untouched)
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const DIR = 'public/images'

// Max width per image type. Carousel cards render at 680px, so 1360 covers 2x screens.
const widthFor = (name) => {
  if (/cover|simulator/i.test(name)) return 1360
  if (/profile/i.test(name)) return 1024 // Lanyard face texture is 1024px wide
  if (/logo/i.test(name)) return 256
  return 1600
}

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f))

for (const file of files) {
  const out = path.join(DIR, file.replace(/\.(png|jpe?g)$/i, '.webp'))
  const info = await sharp(path.join(DIR, file))
    .resize({ width: widthFor(file), withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out)
  console.log(`${file} -> ${path.basename(out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
}