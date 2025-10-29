/* eslint-disable react/no-unknown-property */
"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, Text, useGLTF } from "@react-three/drei"
import { Suspense } from "react"

function HoodieModel() {
  // ✅ Load your actual 3D model from public/models/clothes.glb
  const { scene } = useGLTF("/models/clothes.glb")

  return (
    <group scale={2} position={[0, -1, 0]}>
      {/* Render hoodie model */}
      <primitive object={scene} />

      {/* Floating or “printed” logo */}
      <Text
        position={[0, 0.6, 1]} // Adjust depending on your model
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

// ✅ Required so Next.js doesn’t tree-shake your .glb loader
useGLTF.preload("/models/clothes.glb")

export function ThreePreview() {
  return (
    <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden glass-dark">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        {/* Background */}
        <color attach="background" args={["#0a0a0a"]} />

        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 3]} intensity={1.2} />
        <spotLight position={[-4, 4, 2]} angle={0.4} intensity={1.1} />

        <Suspense fallback={null}>
          <Stage intensity={0.6} environment="city">
            <HoodieModel />
          </Stage>
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.4} />
      </Canvas>
    </div>
  )
}
