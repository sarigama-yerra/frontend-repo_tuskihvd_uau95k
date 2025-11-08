import React from 'react'
import HeroSpline from './components/HeroSpline'
import OverlayIntro from './components/OverlayIntro'
import ScrollForge from './components/ScrollForge'
import ExpensiveHUD from './components/ExpensiveHUD'

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-inter">
      {/* immersive animated hero using Spline asset */}
      <HeroSpline />

      {/* subtle HUD and intro copy */}
      <ExpensiveHUD />
      <OverlayIntro />

      {/* three.js reflective forge with scroll-driven assembly */}
      <ScrollForge />

      {/* footer/contact section */}
      <section id="contact" className="relative z-10 bg-[#0a0a1a]/90 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-semibold">Start Your Project</h3>
            <p className="mt-2 text-cyan-200/80">Tell us about your vision. We’ll forge it into a masterpiece.</p>
          </div>
          <form className="grid gap-4">
            <input className="bg-white/5 border border-white/10 rounded px-4 py-3 outline-none focus:border-cyan-400/60" placeholder="Your name" />
            <input className="bg-white/5 border border-white/10 rounded px-4 py-3 outline-none focus:border-cyan-400/60" placeholder="Email" type="email" />
            <textarea className="bg-white/5 border border-white/10 rounded px-4 py-3 h-32 outline-none focus:border-cyan-400/60" placeholder="Project details" />
            <button type="submit" className="justify-self-start px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition">Send Request</button>
          </form>
        </div>
        <div className="text-center text-xs text-white/60 pb-10">© {new Date().getFullYear()} The Architect's Forge</div>
      </section>
    </div>
  )
}

export default App
