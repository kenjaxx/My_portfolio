# Kenji Ermita — Portfolio

Personal developer portfolio built with React, Vite and Framer Motion. Dark, techy look with cyan and purple accents, lots of canvas / WebGL work, and attention to accessibility and performance.

## Tech Stack

- **React 18** — UI framework
- **Vite** — build tool and dev server
- **Framer Motion** — section, navbar and popup animations
- **Three.js** — the 3D lanyard badge in the About section
- **WebGL / Canvas 2D** — RetroGrid floor, glass skill tiles, particle name
- **react-icons** — all icons (`react-icons/fa`)
- **CSS Modules** — scoped component styles
- **Rajdhani + JetBrains Mono** — fonts
- **ESLint, Prettier, Lighthouse CI** — code quality tooling

## Features

- Particle-text name with a real `<h1>` underneath as a fallback (visible before the font loads, and always available to screen readers)
- Animated RetroGrid perspective floor (WebGL shader with a CSS-only fallback)
- Tech timeline strip with a rocket that lights up each skill it touches
- Rotating role text written as a terminal command
- Floating glass navbar with a spotlight border and scroll-spy
- Interactive 3D lanyard badge (drag, flip, physics) on capable devices, static photo on low-power ones
- Skills grid made of WebGL glass tiles with accessible tabs (arrow keys, Home / End) and a detail popup for each skill
- 3D circular project carousel with a split-flap board in the project popup
- Contact section with copy-to-clipboard email and an animated career timeline
- Shared accessible `Modal` (focus trap, `inert` page, focus returns to the trigger, Escape to close)
- Respects `prefers-reduced-motion` everywhere; low-power device detection (`?lowpower` forces it for testing)
- Responsive: mobile, tablet, desktop

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output goes to dist/
npm run preview    # serve the production build locally
```

## Scripts

| Script                   | What it does                                          |
| ------------------------ | ----------------------------------------------------- |
| `npm run lint`           | Runs ESLint (React, hooks and accessibility rules)    |
| `npm run lint:fix`       | Runs ESLint and fixes what it can                     |
| `npm run format`         | Formats the project with Prettier                     |
| `npm run format:check`   | Checks formatting without changing files              |
| `npm run lighthouse`     | Builds, then runs Lighthouse CI against the preview   |
| `npm run optimize:images`| Converts `public/images` to WebP at sensible sizes    |

GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, build and Lighthouse CI on every push and pull request. Score thresholds live in `lighthouserc.json`.

## Deploying to Netlify

### Option A — Drag and drop

1. Run `npm run build`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder in

### Option B — GitHub + auto deploy

1. Push the project to a GitHub repo
2. In Netlify choose **Add new site** → **Import from Git** and connect the repo
3. Build command: `npm run build`, publish directory: `dist`
4. Every push to the main branch deploys automatically

`netlify.toml` already contains the build settings and the SPA redirect.

## Customization

- **Content** lives in `src/data.js`: nav links, roles, skills, projects, contact details, About text, and the hero timeline.
- **Contact details** (`CONTACT` in `src/data.js`) are the single source for the email, GitHub, LinkedIn and resume links. Contact, Footer, Hero and Projects all read from it.
- **Skill popups** (levels, blurbs, breakdown bars) live in `src/skillInfo.js`.
- **Skill icons** live in `src/skillIcons.js`, shared by the Skills section and the hero timeline.
- **Colors and fonts** are CSS variables in `src/index.css`. Use `--text-dim` for secondary text (it passes WCAG AA); `--decor` is only for decorative marks.

## Project Structure

```
portfolio/
├── .github/workflows/ci.yml
├── public/
│   ├── images/
│   └── favicon.svg
├── scripts/
│   ├── add-tooling.mjs
│   └── optimize-images.mjs
├── src/
│   ├── components/
│   │   ├── Navbar / Hero / About / Skills / Projects / Contact / Footer
│   │   ├── Modal.jsx                 shared popup used by Projects and Skills
│   │   ├── ParticleText.jsx          particle name in the hero
│   │   ├── RetroGrid.jsx             WebGL perspective floor
│   │   ├── TechTimeline.jsx          rocket + skill badges strip
│   │   ├── RotatingText.jsx          rotating role text
│   │   ├── Lanyard.jsx               3D badge (Three.js)
│   │   ├── GlassIcons.jsx            WebGL glass skill tiles
│   │   ├── CircularCarousel.jsx      3D project carousel
│   │   ├── SplitFlapText.jsx         split-flap board in the project popup
│   │   ├── CareerTimeline.jsx        animated timeline in Contact
│   │   └── *.module.css / *.css
│   ├── hooks/
│   │   ├── useInView.js
│   │   └── useModal.js               focus trap, inert page, focus return, Escape
│   ├── utils/deviceTier.js           low-power device detection
│   ├── App.jsx
│   ├── data.js
│   ├── skillIcons.js
│   ├── skillInfo.js
│   ├── index.css
│   └── main.jsx
├── eslint.config.mjs
├── lighthouserc.json
├── .prettierrc.json
├── index.html
├── vite.config.js
├── netlify.toml
├── package.json
└── README.md
```