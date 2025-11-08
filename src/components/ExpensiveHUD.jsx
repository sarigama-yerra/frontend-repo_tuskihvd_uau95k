import React from 'react'

const ExpensiveHUD = () => {
  return (
    <div className="pointer-events-none fixed top-0 left-0 w-full flex items-start justify-between p-6 text-xs tracking-widest text-cyan-200/60">
      <div className="hidden sm:block">
        <span className="opacity-70">THE ARCHITECT'S FORGE</span>
      </div>
      <div className="flex gap-4">
        <span className="opacity-70">v1.0</span>
        <span className="opacity-70">SYS: ONLINE</span>
      </div>
    </div>
  )
}

export default ExpensiveHUD
