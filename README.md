# Kenji Ermita — Portfolio

Personal developer portfolio built with React + Vite + Framer Motion.

## Tech Stack

- **React 18** — UI framework
- **Vite** — build tool & dev server
- **Framer Motion** — animations
- **CSS Modules** — scoped component styles
- **JetBrains Mono + Syne** — fonts

## Features

- Animated particle network hero background
- Typewriter role cycling effect
- Scroll-triggered section animations (Framer Motion)
- Responsive — mobile, tablet, desktop
- Dark techy aesthetic with cyan + purple accents
- Glassmorphism project cards
- Animated terminal in contact section

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## Deploying to Netlify

### Option A — Drag & Drop (fastest)

1. Run `npm run build`
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `dist/` folder
4. Done — you get a live URL instantly!

### Option B — GitHub + Auto Deploy

1. Push this project to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**
6. Every `git push` will auto-deploy!

---

## Customization

All content lives in `src/data.js` — edit your name, roles, skills, and projects there.

```js
// src/data.js
export const ROLES = ['Full Stack Developer', 'React Developer', ...]
export const SKILLS = [{ name: 'React', icon: '⚛', color: '#61dafb' }, ...]
export const PROJECTS = [{ title: 'My Project', description: '...', tags: [...] }]
```

---

## Project Structure

```
kenji-portfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / .module.css
│   │   ├── Hero.jsx / .module.css
│   │   ├── ParticlesBackground.jsx
│   │   ├── About.jsx / .module.css
│   │   ├── Skills.jsx / .module.css
│   │   ├── Projects.jsx / .module.css
│   │   ├── Contact.jsx / .module.css
│   │   └── Footer.jsx / .module.css
│   ├── hooks/
│   │   └── useInView.js
│   ├── App.jsx
│   ├── data.js
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── netlify.toml
├── package.json
└── README.md
```
