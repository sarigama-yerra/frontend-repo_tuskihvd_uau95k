import React from 'react'

const OverlayIntro = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center text-white">
      <div className="max-w-3xl px-6">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
          The Architect's Forge
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-cyan-200/80">
          Ideas Forged into Reality
        </p>
        <div className="mt-12 animate-pulse text-cyan-300/90">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Scroll to Begin Forging
          </span>
        </div>
      </div>
    </section>
  )
}

export default OverlayIntro
