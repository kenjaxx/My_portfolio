import { PROJECTS } from './data'

/*
  The content for every skill's popup. EDIT THIS FILE to match your real
  skill levels. Everything here is a first draft guessed from your projects.

  level   1 to 5      (see LEVELS below)
  status  'daily' | 'projects' | 'learning' | 'familiar'   (see STATUS below)
  blurb   one short line: what you use it for
  subs    optional breakdown bars, each value 1 to 5 (used for core skills)
  match   optional extra project tags that count as this skill
          (e.g. Gemini matches the "Gemini API" tag)

  The "Used in" project chips are built automatically by matching the skill
  name against the tags of each project in data.js.
*/

export const LEVELS = ['', 'Learning', 'Familiar', 'Comfortable', 'Strong', 'Advanced']

export const STATUS = {
  daily: { label: 'Daily driver', color: '#00ff88' },
  projects: { label: 'Used in projects', color: '#00d4ff' },
  learning: { label: 'Currently learning', color: '#ffca28' },
  familiar: { label: 'Familiar', color: '#94a3b8' },
}

const SKILL_INFO = {
  /* ---------- Languages ---------- */
  JavaScript: {
    level: 4,
    status: 'daily',
    blurb: 'The language behind most of my UI logic, async calls and DOM work.',
    subs: [
      { name: 'ES6+ syntax', value: 4 },
      { name: 'Async / Promises', value: 4 },
      { name: 'DOM & events', value: 4 },
      { name: 'APIs & fetch', value: 4 },
    ],
  },
  TypeScript: {
    level: 3,
    status: 'learning',
    blurb: 'Adds types to my JavaScript so bugs show up before the browser does.',
  },
  Python: {
    level: 3,
    status: 'projects',
    blurb: 'Scripting, automation and backend logic.',
    subs: [
      { name: 'Scripting', value: 4 },
      { name: 'OOP', value: 3 },
      { name: 'Data handling', value: 3 },
      { name: 'Web (Django)', value: 2 },
    ],
  },
  Java: {
    level: 3,
    status: 'projects',
    blurb: 'Object-oriented programming and structured backends.',
    subs: [
      { name: 'OOP', value: 4 },
      { name: 'Data structures', value: 3 },
      { name: 'Console & desktop apps', value: 3 },
      { name: 'Backend basics', value: 3 },
    ],
  },
  HTML: {
    level: 4,
    status: 'daily',
    blurb: 'Clean, semantic markup that works well for people and search engines.',
    subs: [
      { name: 'Semantic markup', value: 4 },
      { name: 'Forms', value: 4 },
      { name: 'Accessibility', value: 3 },
      { name: 'SEO basics', value: 3 },
    ],
  },
  CSS: {
    level: 4,
    status: 'daily',
    blurb: 'Layouts, animations and responsive design, mostly with CSS Modules.',
    subs: [
      { name: 'Flexbox & Grid', value: 4 },
      { name: 'Animations', value: 4 },
      { name: 'Responsive design', value: 4 },
      { name: 'CSS Modules', value: 4 },
    ],
  },
  SQL: {
    level: 3,
    status: 'projects',
    blurb: 'Querying and shaping data in relational databases.',
  },

  /* ---------- Tools & frameworks ---------- */
  React: {
    level: 4,
    status: 'daily',
    blurb: 'Component-based UIs with hooks, state and smooth animations.',
    subs: [
      { name: 'Hooks', value: 4 },
      { name: 'State management', value: 4 },
      { name: 'Routing', value: 3 },
      { name: 'Performance', value: 3 },
    ],
  },
  'Next.js': {
    level: 2,
    status: 'learning',
    blurb: 'Exploring server rendering and file-based routing on top of React.',
  },
  'Tailwind CSS': {
    level: 4,
    status: 'daily',
    blurb: 'Fast, consistent styling with utility classes.',
    subs: [
      { name: 'Utility classes', value: 4 },
      { name: 'Responsive design', value: 4 },
      { name: 'Custom config', value: 3 },
      { name: 'Component patterns', value: 3 },
    ],
  },
  Django: {
    level: 2,
    status: 'learning',
    blurb: 'Learning Python web development with its batteries-included approach.',
  },
  'Node.js': {
    level: 3,
    status: 'projects',
    blurb: 'JavaScript on the server, plus tooling and package management.',
  },
  'REST API': {
    level: 4,
    status: 'projects',
    blurb: 'Designing and consuming clean, predictable HTTP APIs.',
  },
  Supabase: {
    level: 4,
    status: 'projects',
    blurb: 'Postgres, auth and realtime data without running my own server.',
    subs: [
      { name: 'Auth', value: 4 },
      { name: 'Database & SQL', value: 4 },
      { name: 'Realtime', value: 3 },
      { name: 'Row-level security', value: 3 },
    ],
  },
  Firebase: {
    level: 4,
    status: 'projects',
    blurb: 'Auth, Firestore and hosting for fast serverless apps.',
    subs: [
      { name: 'Auth', value: 4 },
      { name: 'Firestore', value: 3 },
      { name: 'Hosting', value: 4 },
      { name: 'App Check & rules', value: 3 },
    ],
  },
  MySQL: {
    level: 3,
    status: 'projects',
    blurb: 'Relational databases for classic web stacks.',
  },
  PostgreSQL: {
    level: 3,
    status: 'familiar',
    blurb: 'A reliable relational database, and the engine under Supabase.',
  },
  Prisma: {
    level: 2,
    status: 'learning',
    blurb: 'Type-safe database access through an ORM.',
  },
  XAMPP: {
    level: 3,
    status: 'projects',
    blurb: 'A quick local Apache, PHP and MySQL environment for testing.',
  },
  WordPress: {
    level: 3,
    status: 'projects',
    blurb: 'Building and customizing CMS-driven sites.',
  },
  Git: {
    level: 4,
    status: 'daily',
    blurb: 'Branching, merging and keeping a clean history.',
  },
  GitHub: {
    level: 4,
    status: 'daily',
    blurb: 'Code hosting, pull requests and automatic deploys.',
  },
  'VS Code': {
    level: 4,
    status: 'daily',
    blurb: 'My main editor, tuned for fast front-end work.',
  },
  'Claude Code': {
    level: 4,
    status: 'daily',
    blurb: 'An AI pair programmer for building, refactoring and debugging.',
  },
  Gemini: {
    level: 3,
    status: 'projects',
    blurb: 'Adding AI features like image tagging and interview feedback to apps.',
    match: ['Gemini API'],
  },
  Postman: {
    level: 3,
    status: 'projects',
    blurb: 'Testing and debugging API requests.',
  },
  Bash: {
    level: 2,
    status: 'familiar',
    blurb: 'Command-line basics and small automation scripts.',
  },
  PowerShell: {
    level: 2,
    status: 'familiar',
    blurb: 'Windows command-line tasks and scripting.',
  },
  AWS: {
    level: 2,
    status: 'learning',
    blurb: 'Getting familiar with core cloud services.',
  },
  Android: {
    level: 2,
    status: 'familiar',
    blurb: 'Basic mobile app concepts on the Android platform.',
  },
  Vercel: {
    level: 3,
    status: 'projects',
    blurb: 'One-click deploys and previews for front-end apps.',
  },
  Railway: {
    level: 3,
    status: 'projects',
    blurb: 'Deploying backends and databases with very little setup.',
  },
  ServiceNow: {
    level: 2,
    status: 'familiar',
    blurb: 'Platform basics for IT service workflows.',
  },
}

const FALLBACK = {
  level: 2,
  status: 'familiar',
  blurb: '',
  subs: null,
  match: [],
}

export function getSkillInfo(name) {
  return { ...FALLBACK, ...(SKILL_INFO[name] || {}) }
}

/* Projects whose tags include this skill (or one of its aliases). */
export function getProjectsFor(name) {
  const info = getSkillInfo(name)
  const wanted = [name, ...(info.match || [])].map((s) => s.toLowerCase())
  return PROJECTS.filter((p) => p.tags.some((t) => wanted.includes(t.toLowerCase())))
}