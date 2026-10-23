export const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'skills', href: '#skills' },
  { label: 'projects', href: '#projects' },
  { label: 'contact', href: '#contact' },
]

export const ROLES = ['React Developer', 'Python Enthusiast', 'Problem Solver']

export const SKILL_GROUPS = [
  {
    key: 'languages',
    label: 'Languages',
    skills: [
      { name: 'JavaScript', color: '#f7df1e' },
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'Python', color: '#3776ab' },
      { name: 'Java', color: '#f89820' },
      { name: 'HTML', color: '#e34f26' },
      { name: 'CSS', color: '#1572b6' },
      { name: 'SQL', color: '#4479a1' },
    ],
  },
  {
    key: 'tools',
    label: 'Tools & Frameworks',
    skills: [
      { name: 'React', color: '#61dafb' },
      { name: 'Next.js', color: '#ffffff' },
      { name: 'Tailwind CSS', color: '#38bdf8' },
      { name: 'Django', color: '#0c4b33' },
      { name: 'Node.js', color: '#3c873a' },
      { name: 'REST API', color: '#00d4ff' },
      { name: 'Supabase', color: '#3ecf8e' },
      { name: 'Firebase', color: '#ffca28' },
      { name: 'MySQL', color: '#4479a1' },
      { name: 'PostgreSQL', color: '#336791' },
      { name: 'Prisma', color: '#2d3748' },
      { name: 'XAMPP', color: '#fb7a24' },
      { name: 'WordPress', color: '#21759b' },
      { name: 'Git', color: '#f05032' },
      { name: 'GitHub', color: '#ffffff' },
      { name: 'VS Code', color: '#007acc' },
      { name: 'Claude Code', color: '#d97757' },
      { name: 'Gemini', color: '#8e75f2' },
      { name: 'Postman', color: '#ff6c37' },
      { name: 'Bash', color: '#4eaa25' },
      { name: 'PowerShell', color: '#5391fe' },
      { name: 'AWS', color: '#ff9900' },
      { name: 'Android', color: '#3ddc84' },
      { name: 'Vercel', color: '#ffffff' },
      { name: 'Railway', color: '#a06afe' },
      { name: 'ServiceNow', color: '#62d84e' },
    ],
  },
]

/*
  Each project has:

  tagline   one short line shown under the project name above the carousel
  problem   what was wrong or missing (amber card in the popup)
  solution  what you built (cyan card in the popup)
  result    what the visitor gets (green card in the popup)

  Keep the tagline under about 7 words, and each card line under about 10.
  These are first drafts written from your old descriptions. Edit freely.
*/
export const PROJECTS = [
  {
    id: '001',
    title: 'Billify',
    tagline: 'Track bills and budgets in one place',
    problem: 'Bills get missed and spending is hard to track.',
    solution: 'Sorts bills by status and category, with live budgets.',
    result: 'Paid, unpaid and overdue at a glance. Export to CSV or PDF.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'Supabase', 'Resend'],
    github: 'https://github.com/kenjaxx/billify',
    live: 'https://billify-02f8.onrender.com/bills',
    image: '/images/billify-cover.webp',
    featured: true,
    color: '#00d4ff',
  },
  {
    id: '002',
    title: 'Closet — AI Outfit Matcher',
    tagline: 'AI that picks your outfit',
    problem: 'A full closet, but nothing to wear.',
    solution: 'Gemini tags each photo, then pairs pieces from your wardrobe.',
    result: 'Outfit ideas for any occasion or weather.',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Firebase', 'Cloudinary', 'Gemini API', 'PWA'],
    github: 'https://github.com/kenjaxx/closet-ai',
    live: 'https://closet-ai-ebc44.web.app',
    image: '/images/closet-ai-cover.webp',
    featured: false,
    color: '#00ff88',
  },
  {
    id: '003',
    title: 'Rehearse',
    tagline: 'AI mock interviews with instant feedback',
    problem: 'Interview practice rarely comes with real feedback.',
    solution: 'AI scores your spoken or typed answers.',
    result: 'Tracks filler words and pace, with saved history and PDF export.',
    tags: ['React', 'Firebase', 'Gemini API', 'Vercel', 'JavaScript'],
    github: 'https://github.com/kenjaxx/ai-interview-simulator',
    live: 'https://ai-interview-simulator-ochre.vercel.app/',
    image: '/images/ai-interview-simulator.webp',
    featured: false,
    color: '#7c3aed',
  },
  {
    id: '004',
    title: 'House Selling Site',
    tagline: 'A single-page property showcase',
    problem: 'Property details are scattered and hard to act on.',
    solution: 'A static page with pricing, room details and a gallery.',
    result: 'Visitors schedule a tour or contact the agent in one click.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/kenjaxx/house-selling-site',
    live: 'https://kenjaxx.github.io/house-selling-site/',
    image: '/images/house-selling-cover.webp',
    featured: false,
    color: '#7c3aed',
  },
]

// The single source of truth for contact details. Contact, Footer and Hero
// read from here, so a change only has to be made once.
export const CONTACT = {
  github: 'https://github.com/kenjaxx',
  linkedin: 'https://www.linkedin.com/in/kenji-ermita-1375b1392/',
  email: 'kenjiermita2020@gmail.com',
  resume: '/Kenji_Ermita_Resume_.pdf',
}

export const PROFILE = {
  aboutPhoto: '/images/profile-about.webp',
  schoolLogo: '/images/citu-logo.webp',
  experienceLogo: '/images/knowles-logo.webp',
}

// Content for the About section.
export const ABOUT = {
  badge: 'About',
  headingGradient: 'Full Stack',
  headingRest: 'Developer.',
  bio: 'I care about the details: fast, accessible, responsive interfaces backed by clean data, from the first component to the final deploy.',

  // The flip cards under the bio. Click or tap a card to turn it over.
  //   num    the big faint number on the front
  //   title  the short line on the front
  //   text   the longer line on the back (keep it under about 140 characters)
  //   color  tints the card's accent bar, watermark number and back border
  cards: [
    {
      id: 'fullstack',
      num: '01',
      title: 'Full-stack range',
      text: 'I work across the whole stack, from interface to API to database, so I can pick up whatever the next task needs.',
      color: '#00d4ff',
    },
    {
      id: 'ownership',
      num: '02',
      title: 'I own my work',
      text: "Give me a task and I'll see it through: build it, test it, fix what breaks and keep you updated.",
      color: '#00ff88',
    },
    {
      id: 'learn',
      num: '03',
      title: 'I learn fast',
      text: 'New language, framework or tool? The fundamentals carry over, so I pick things up fast and get productive early.',
      color: '#a78bfa',
    },
    {
      id: 'ready',
      num: '04',
      title: 'Ready to contribute',
      text: 'I can start on real tasks quickly: clean, readable code, team conventions followed, and help asked for early instead of getting stuck.',
      color: '#ffca28',
    },
  ],

  // `education` and `experience` below feed the two cards under the flip cards.
  // `stats`, `location` and `phone` are not shown in the About section any more;
  // they are kept in case another component reads them.
  // For stats, `num` + `suffix` count up. `text` is shown as-is (no counting).
  stats: [
    { num: 30, suffix: '+', label: 'Technologies' },
    { num: 4, suffix: '', label: 'Live apps' },
    { text: '<24h', label: 'Reply time' },
  ],

  location: 'Cebu, Philippines',
  phone: '',
  education: {
    school: 'Cebu Institute of Technology - University (CIT-U)',
    degree: 'BS Information Technology',
    period: 'IT Graduate',
  },
  experience: {
    company: 'Knowles Training Institute',
    role: 'IT Intern (OJT)',
    period: '2026 · Remote, Singapore',
  },
}

// Flat list used by the animated tech timeline strip in Hero.
export const TIMELINE_SKILLS = [
  { name: 'React', color: '#61dafb' },
  { name: 'Python', color: '#3776ab' },
  { name: 'Java', color: '#f89820' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Node.js', color: '#3c873a' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'HTML', color: '#e34f26' },
  { name: 'CSS', color: '#1572b6' },
  { name: 'Git', color: '#f05032' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'SQL', color: '#4479a1' },
]