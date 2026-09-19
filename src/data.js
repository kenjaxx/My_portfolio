export const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'skills', href: '#skills' },
  { label: 'projects', href: '#projects' },
  { label: 'contact', href: '#contact' },
]

export const ROLES = [
  'React Developer',
  'Python Enthusiast',
  'Problem Solver',
]

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

// Featured/recent projects — Billify, Closet AI, Shoecommerce, House Selling Site
export const PROJECTS = [
  {
    id: '001',
    title: 'Billify',
    description:
      'A personal bill-management and budgeting dashboard built with React and Supabase. Users can track bills by status (Paid, Unpaid, Overdue), organize spending by category, monitor budgets in real time, and export records to CSV or PDF for reporting.',
    tags: ['React', 'Supabase'],
    github: null, // TODO: add the Billify repo link
    live: 'https://billify-02f8.onrender.com/bills',
    image: '/images/billify-cover.png',
    featured: true,
  },
  {
    id: '002',
    title: 'Closet — AI Outfit Matcher',
    description:
      "A mobile-first PWA that lets you snap a photo of a clothing item, has Gemini AI tag it (category, color, pattern, style, formality, season) and file it into a digital closet, then suggests outfit pairings from your existing wardrobe for any occasion or the day's weather. Extra touches include duplicate-item detection, a \"neglected pieces\" nudge, wardrobe gap analysis, and a save-to-lookbook feature — all running on free-tier Firebase, Cloudinary, and Gemini.",
    tags: ['React', 'Vite', 'Tailwind CSS', 'Firebase', 'Cloudinary', 'Gemini API', 'PWA'],
    github: null, // TODO: add the Closet AI repo link (or leave null if private)
    live: 'https://closet-ai-ebc44.web.app', // TODO: confirm this actually loads before shipping
    image: '/images/closet-ai-cover.png',
    featured: false, // TODO: flip to true if you want this instead of Billify featured
  },
  {
    id: '003',
    title: 'Shoecommerce',
    description:
      'A full-stack e-commerce app for shoe retail, built end-to-end with React and Supabase. Implements user authentication, a browsable product catalog, cart management, and a complete checkout and order-tracking flow behind a clean, responsive UI.',
    tags: ['React', 'Supabase', 'JavaScript', 'CSS'],
    github: 'https://github.com/kenjaxx',
    live: 'https://shoestore-emd2.onrender.com/',
    image: '/images/shoecommerce.jpg',
    featured: false,
  },
  {
    id: '004',
    title: 'House Selling Site',
    description:
      'A static real estate listing site built with vanilla HTML, CSS, and JavaScript. Showcases a property with pricing, room details, an image gallery, and clear calls-to-action to schedule a tour or contact the agent directly.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/kenjaxx/house-selling-site',
    live: 'https://kenjaxx.github.io/house-selling-site/',
    image: '/images/house-selling-cover.png',
    featured: false,
  },
]

export const CONTACT = {
  github: 'https://github.com/kenjaxx',
  linkedin: 'https://www.linkedin.com/in/kenji-ermita-1375b1392/',
  email: 'kenjiermita2020@gmail.com',
  resume: '/Kenji_Ermita_Resume.pdf',
}

// Add your own photos to /public/images/ with these filenames (or update
// the paths here to match whatever you name them).
export const PROFILE = {
  heroPhoto: '/images/profile-hero.jpg',
  aboutPhoto: '/images/profile-about.jpg', // your graduation photo
  schoolLogo: '/images/citu-logo.png', // CIT-U seal
  experienceLogo: '/images/knowles-logo.png',
}

// Content for the redesigned About section (big photo + editorial layout).
// Fill in the TODOs with your real info.
export const ABOUT = {
  badge: 'About',
  headingLead: '',
  headingAccent: 'Full Stack Developer.',
  bio: "BSIT graduate who loves turning ideas into real, working products — from pixel-perfect React UIs to well-structured Python & Java backends, with Supabase powering real-time data underneath. Whether it's a web app, a CMS, or a REST API, I build it end-to-end.",
  stats: [
    { num: '10+', label: 'Technologies' },
    { num: '5+', label: 'Projects Built' },
    { num: '1', label: 'Internship (OJT)' },
  ],
  location: 'Cebu, Philippines',
  phone: '',
  photoCaption: 'Cebu, Philippines',
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