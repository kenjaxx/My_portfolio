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

// Grouped to match how the tech is actually used (mirrors the
// kenji.config.js block below it), rather than one flat, ungrouped grid.
export const SKILL_GROUPS = [
  {
    key: 'frontend',
    label: 'Frontend',
    skills: [
      { name: 'React', icon: '⚛', color: '#61dafb' },
      { name: 'JavaScript', icon: '✦', color: '#f7df1e' },
      { name: 'HTML', icon: '🌐', color: '#e34f26' },
      { name: 'CSS', icon: '🎨', color: '#1572b6' },
    ],
  },
  {
    key: 'backend',
    label: 'Backend',
    skills: [
      { name: 'Java', icon: '☕', color: '#f89820' },
      { name: 'Python', icon: '🐍', color: '#3776ab' },
      { name: 'REST API', icon: '🔌', color: '#00d4ff' },
    ],
  },
  {
    key: 'tools',
    label: 'Database & Tools',
    skills: [
      { name: 'Supabase', icon: '⚡', color: '#3ecf8e' },
      { name: 'WordPress', icon: '📝', color: '#21759b' },
      { name: 'Git', icon: '⎇', color: '#f05032' },
    ],
  },
]

// Top 3 featured projects — Billify, Shoecommerce, House Selling Site
export const PROJECTS = [
  {
    id: '001',
    title: 'Billify',
    description:
      'A personal bill-management and budgeting dashboard built with React and Supabase. Users can track bills by status (Paid, Unpaid, Overdue), organize spending by category, monitor budgets in real time, and export records to CSV or PDF for reporting.',
    tags: ['React', 'Supabase'],
    github: null, // TODO: add the Billify repo link
    live: 'https://billify-02f8.onrender.com/bills',
    image: '/images/billify.png',
    featured: true,
  },
  {
    id: '002',
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
    id: '003',
    title: 'House Selling Site',
    description:
      'A static real estate listing site built with vanilla HTML, CSS, and JavaScript. Showcases a property with pricing, room details, an image gallery, and clear calls-to-action to schedule a tour or contact the agent directly.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/kenjaxx/house-selling-site',
    live: 'https://kenjaxx.github.io/house-selling-site/',
    image: '/images/dreamhome.png',
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
  heroPhoto: '/images/profile-hero.jpg', // larger photo used in the Hero section
  avatarPhoto: '/images/profile-avatar.jpg', // tighter head-and-shoulders crop used in About
}