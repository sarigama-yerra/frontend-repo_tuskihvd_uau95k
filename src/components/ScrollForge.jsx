import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'

// Scroll-driven “forging” scene using Three.js + postprocessing
const ScrollForge = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // scene, camera
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0a1a')
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 200)
    camera.position.set(6, 4, 10)

    // controls for debug (disabled interactions)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false

    // lights
    const key = new THREE.SpotLight(0xffffff, 1.2, 50, Math.PI / 6, 0.3, 1)
    key.position.set(8, 12, 10)
    key.castShadow = false
    scene.add(key)

    const rim = new THREE.DirectionalLight(0x00bfff, 1.0)
    rim.position.set(-6, 4, -8)
    scene.add(rim)

    // reflective platform via Reflector
    const reflectorGeo = new THREE.PlaneGeometry(60, 60)
    const reflector = new Reflector(reflectorGeo, {
      clipBias: 0.003,
      textureWidth: container.clientWidth * window.devicePixelRatio,
      textureHeight: container.clientHeight * window.devicePixelRatio,
      color: 0x111122,
    })
    reflector.rotateX(-Math.PI / 2)
    scene.add(reflector)

    // core
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 2)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff8c1a })
    const core = new THREE.Mesh(coreGeo, coreMat)
    core.position.y = 1.4
    scene.add(core)

    // pulsing core
    let pulseT = 0

    // chassis (wireframe of torus knot)
    const complexGeo = new THREE.TorusKnotGeometry(1.1, 0.28, 220, 24)
    const edges = new THREE.EdgesGeometry(complexGeo)
    const chassis = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0 })
    )
    chassis.position.y = 1.4
    scene.add(chassis)

    // skin – sleek white/metal
    const skin = new THREE.Mesh(
      complexGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f4f7ff'),
        metalness: 0.85,
        roughness: 0.12,
        transparent: true,
        opacity: 0,
        emissive: new THREE.Color('#0a0a1a'),
        emissiveIntensity: 0.0,
      })
    )
    skin.position.y = 1.4
    scene.add(skin)

    // emissive animated texture for "live" state
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const emissiveTex = new THREE.CanvasTexture(canvas)
    emissiveTex.wrapS = emissiveTex.wrapT = THREE.RepeatWrapping

    const drawEmissive = (offset = 0) => {
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(0, 0, size, size)
      // cyan lines with orange pulses
      for (let i = 0; i < 20; i++) {
        const y = ((i * 12 + offset) % size)
        ctx.fillStyle = i % 5 === 0 ? 'rgba(255,140,0,0.9)' : 'rgba(0,191,255,0.85)'
        ctx.fillRect(0, y, size, 2)
      }
      emissiveTex.needsUpdate = true
    }

    skin.material.emissiveMap = emissiveTex

    // postprocessing
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.2, 0.8, 0.85)
    bloom.threshold = 0.0
    bloom.strength = 1.3
    bloom.radius = 0.7
    composer.addPass(bloom)

    const bokeh = new BokehPass(scene, camera, {
      focus: 2.0,
      aperture: 0.00015,
      maxblur: 0.015,
    })
    composer.addPass(bokeh)

    // handle resize
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      composer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // scroll mapping 0 → 1
    const getScrollProgress = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      return maxScroll > 0 ? window.scrollY / maxScroll : 0
    }

    // robotic arms: simple linked cylinders
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.2 })
    const mkArm = (basePos) => {
      const group = new THREE.Group()
      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 16), armMat)
      seg1.position.y = 1
      seg1.rotation.z = Math.PI / 6
      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16), armMat)
      seg2.position.set(0.6, 2.2, 0)
      seg2.rotation.z = -Math.PI / 8
      group.add(seg1)
      group.add(seg2)
      group.position.copy(basePos)
      group.visible = false
      scene.add(group)
      return group
    }

    const armLeft = mkArm(new THREE.Vector3(-2.2, 0.2, 0))
    const armRight = mkArm(new THREE.Vector3(2.2, 0.2, 0))

    // laser scanners (lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0 })
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.5, 1.4, 0),
      new THREE.Vector3(1.5, 1.4, 0),
    ])
    const scanLine = new THREE.Line(lineGeo, lineMat)
    scene.add(scanLine)

    // animation loop
    let raf
    const clock = new THREE.Clock()

    const animate = () => {
      const dt = clock.getDelta()
      pulseT += dt
      const t = getScrollProgress() // 0..1

      // camera path
      const startPos = new THREE.Vector3(6, 4, 10)
      const closePos = new THREE.Vector3(2.2, 1.8, 3)
      const endPos = new THREE.Vector3(7, 5, 11)
      let camPos
      if (t < 0.25) {
        camPos = startPos.clone().lerp(closePos, t / 0.25)
      } else if (t < 0.75) {
        camPos = closePos.clone().lerp(closePos.clone().add(new THREE.Vector3(0.5, 0.2, -0.2)), (t - 0.25) / 0.5)
      } else {
        camPos = closePos.clone().lerp(endPos, (t - 0.75) / 0.25)
      }
      camera.position.copy(camPos)
      camera.lookAt(0, 1.4, 0)

      // depth of field focus around the object
      bokeh.materialBokeh.uniforms['focus'].value = THREE.MathUtils.lerp(2.5, 1.6, Math.min(t / 0.75, 1))

      // core pulse
      const pulse = 0.15 + Math.sin(pulseT * 2.0) * 0.05
      core.scale.setScalar(1 + pulse)

      // scene 2: reveal arms, scanners, wireframe
      const s2 = THREE.MathUtils.smoothstep((t - 0.15) / 0.15, 0, 1)
      armLeft.visible = armRight.visible = s2 > 0.01
      armLeft.rotation.y = -0.6 + 0.6 * s2
      armRight.rotation.y = 0.6 - 0.6 * s2
      scanLine.material.opacity = s2
      chassis.material.opacity = THREE.MathUtils.clamp((t - 0.2) / 0.15, 0, 1)

      // scene 3: fade in skin
      const s3 = THREE.MathUtils.clamp((t - 0.45) / 0.15, 0, 1)
      skin.material.opacity = s3

      // scene 4: live emissive animation
      const s4 = THREE.MathUtils.clamp((t - 0.65) / 0.2, 0, 1)
      skin.material.emissiveIntensity = s4 * 0.8
      drawEmissive((pulseT * 120) % size)
      emissiveTex.offset.y = -pulseT * 0.2
      emissiveTex.repeat.set(1, 2)

      // scene 5: retract arms, spotlight rotate
      const s5 = THREE.MathUtils.clamp((t - 0.85) / 0.15, 0, 1)
      armLeft.position.x = THREE.MathUtils.lerp(-2.2, -4.5, s5)
      armRight.position.x = THREE.MathUtils.lerp(2.2, 4.5, s5)
      skin.rotation.y += dt * 0.3 * s5

      composer.render()
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    // cleanup
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      container.removeChild(renderer.domElement)
      renderer.dispose()
      coreGeo.dispose()
      complexGeo.dispose()
      edges.dispose()
      emissiveTex.dispose()
    }
  }, [])

  return (
    <section className="relative min-h-[140vh] lg:min-h-[220vh]" ref={mountRef}>
      {/* overlays for copy */}
      <div className="pointer-events-none absolute inset-0 grid grid-rows-[1fr_1fr_1fr_1fr_1fr] text-white">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm tracking-widest text-cyan-200/80">Ideas Forged into Reality</p>
          </div>
        </div>
        <div className="flex items-center justify-end px-6">
          <div className="max-w-md text-right">
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90">WEB DEVELOPMENT</h2>
            <p className="mt-2 text-cyan-200/80">We architect the core. Precision-engineered code for a flawless foundation.</p>
          </div>
        </div>
        <div className="flex items-center justify-start px-6">
          <div className="max-w-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90">GRAPHIC & LOGO DESIGN</h2>
            <p className="mt-2 text-cyan-200/80">We define the identity. Forging a brand that is both iconic and unforgettable.</p>
          </div>
        </div>
        <div className="flex items-center justify-end px-6">
          <div className="max-w-md text-right">
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90">VIDEO & MOTION</h2>
            <p className="mt-2 text-cyan-200/80">We bring it to life. Dynamic storytelling that captivates and holds attention.</p>
          </div>
        </div>
        <div className="flex items-end justify-center pb-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Your Masterpiece is Ready</h2>
            <a href="#contact" className="inline-block mt-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition">Start Your Project</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollForge
