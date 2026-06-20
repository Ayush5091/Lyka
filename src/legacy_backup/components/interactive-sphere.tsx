"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

function SphereShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const { mouse, viewport } = useThree();

  // Use useMemo for the material color to ensure stability
  const materialProps = useMemo(() => ({
    color: "#1a103d", // Darker base color
    emissive: "#6d28d9", // More vibrant violet emissive
    emissiveIntensity: 1.8, // Increased intensity for "alive" glow
    roughness: 0.1,
    metalness: 0.95,
    distort: 0.55,
    speed: 3.5,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Alive entity pulsing logic
    const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.12 + 1;
    meshRef.current.scale.set(pulse, pulse, pulse);

    // React to cursor movement
    const targetX = (mouse.x * viewport.width) / 5;
    const targetY = (mouse.y * viewport.height) / 5;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.05 // Smoother follow
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.05
    );

    meshRef.current.rotation.x += 0.006;
    meshRef.current.rotation.y += 0.006;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[1.2, 64, 64]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          {...materialProps}
          distort={hovered ? 0.6 : 0.4}
        />
      </Sphere>
    </Float>
  );
}

export function InteractiveSphere() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div className="w-full h-full max-w-5xl max-h-[700px] opacity-95">
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={0.15} />
          <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={2.5} />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#8b5cf6" />
          <SphereShape />
        </Canvas>
      </div>
    </div>
  );
}
