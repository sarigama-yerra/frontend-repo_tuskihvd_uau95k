import React from 'react'
import Spline from '@splinetool/react-spline'

const HeroSpline = () => {
  return (
    <div className="fixed inset-0" aria-hidden="true">
      <Spline
        scene="https://prod.spline.design/Ujidb4bmigoHT4IV/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      {/* soft radial vignette to deepen focus */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,140,0,0.18),rgba(0,0,0,0.0)),radial-gradient(80%_70%_at_50%_120%,rgba(0,191,255,0.08),rgba(10,10,26,0.6))]" />
    </div>
  )
}

export default HeroSpline
