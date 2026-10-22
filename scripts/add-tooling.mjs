// Adds the lint / format / Lighthouse scripts and dev dependencies to package.json.
// Run once:  node scripts/add-tooling.mjs   then   npm install
import { readFile, writeFile } from 'node:fs/promises'

const file = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(await readFile(file, 'utf8'))

const scripts = {
  lint: 'eslint .',
  'lint:fix': 'eslint . --fix',
  format: 'prettier --write .',
  'format:check': 'prettier --check .',
  lighthouse: 'npm run build && lhci autorun',
}

const devDependencies = {
  '@eslint/js': '^9.17.0',
  '@lhci/cli': '^0.14.0',
  eslint: '^9.17.0',
  'eslint-config-prettier': '^9.1.0',
  'eslint-plugin-jsx-a11y': '^6.10.2',
  'eslint-plugin-react': '^7.37.3',
  'eslint-plugin-react-hooks': '^5.1.0',
  globals: '^15.14.0',
  prettier: '^3.4.2',
}

pkg.scripts = { ...pkg.scripts, ...scripts }

// Existing versions win, so nothing already installed gets changed.
const merged = { ...devDependencies, ...pkg.devDependencies }
pkg.devDependencies = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)))

await writeFile(file, JSON.stringify(pkg, null, 2) + '\n')
console.log('package.json updated. Now run: npm install')