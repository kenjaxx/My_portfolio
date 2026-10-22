import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { getDeviceTier } from './utils/deviceTier'

export default function App() {
  // Download the lazy chunks after the first paint, while the browser is idle.
  // Skipped entirely on data-saver connections.
  useEffect(() => {
    const tier = getDeviceTier()
    if (tier.saveData) return

    const run = () => {
      import('./components/CircularCarousel')
      import('./components/GlassIcons')
      import('./components/SplitFlapText')
      // Three.js is the biggest chunk, and low-power devices don't use it.
      if (!tier.lowPower) import('./components/Lanyard')
    }

    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 3000))
    const cancel = window.cancelIdleCallback ?? clearTimeout
    const id = idle(run, { timeout: 5000 })
    return () => cancel(id)
  }, [])

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