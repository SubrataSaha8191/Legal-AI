'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBubbles() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create bubble geometries
    const bubbles: THREE.Mesh[] = []
    const bubbleCount = 15

    for (let i = 0; i < bubbleCount; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 32, 32)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.3, 0.7),
        transparent: true,
        opacity: 0.1 + Math.random() * 0.2,
        wireframe: false
      })
      
      const bubble = new THREE.Mesh(geometry, material)
      bubble.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      )
      
      scene.add(bubble)
      bubbles.push(bubble)
    }

    camera.position.z = 10

    const animate = () => {
      requestAnimationFrame(animate)

      bubbles.forEach((bubble, index) => {
        bubble.rotation.x += 0.005
        bubble.rotation.y += 0.005
        bubble.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002
        bubble.position.x += Math.cos(Date.now() * 0.001 + index) * 0.001
      })

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ zIndex: -1 }}
    />
  )
}