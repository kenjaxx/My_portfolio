import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    // reducedMotion="user" tells Framer Motion to automatically respect
    // the visitor's OS-level "prefers-reduced-motion" setting across
    // every motion.* component in the app, with no per-component changes needed.
    <MotionConfig reducedMotion="user">
      <a href="#main-content" className="skipLink">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}