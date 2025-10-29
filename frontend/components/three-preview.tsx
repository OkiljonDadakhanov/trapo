/* eslint-disable react/no-unknown-property */
"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, Text, useGLTF, Environment, ContactShadows } from "@react-three/drei"
import { Suspense } from "react"

function HoodieModel() {
  // Load your compressed hoodie model
  const { scene } = useGLTF("/models/clothes.glb")

  return (
    <group scale={2.6} position={[0, -1.2, 0]}>
      {/* Hoodie model */}
      <primitive object={scene} />

      {/* Logo text on chest */}
      <Text
        position={[0, 0.65, 1.05]} // Adjust based on model center
        fontSize={0.35}
        color="#ff4ecd"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        trapo.
      </Text>
    </group>
  )
}

// Preload the model for smoother experience
useGLTF.preload("/models/clothes.glb")

export function ThreePreview() {
  return (
    <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden glass-dark shadow-2xl mx-auto">
      <Canvas camera={{ position: [0, 0.8, 5], fov: 45 }}>
        {/* Scene Background */}
        <color attach="background" args={["#0a0a0a"]} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <spotLight position={[-5, 6, 3]} angle={0.4} intensity={1.1} penumbra={0.5} />

        <Suspense fallback={null}>
          {/* Environment and stage for realism */}
          <Environment preset="city" />
          <Stage intensity={0.4} environment={null}>
            <HoodieModel />
          </Stage>

          {/* Ground shadow for depth */}
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.5}
            scale={10}
            blur={2.5}
            far={5}
          />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  )
}
