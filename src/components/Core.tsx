"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useOrbAnchors, viewportToWorld } from "@/lib/useOrbAnchors";
import { useOrb } from "@/lib/OrbContext";

/* ───────────────────────────────────────────────────
   GLSL: 3D Simplex Noise (Ashima / webgl-noise)
   ─────────────────────────────────────────────────── */
const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * ns.x + ns.yyyy;
  vec4 y  = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ───────────────────────────────────────────────────
   Vertex Shader
   ─────────────────────────────────────────────────── */
const vertexShader = /* glsl */ `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
uniform float uScale;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDir;

void main() {
  // Organic noise displacement along normal
  float noise = snoise(position * 0.8 + uTime * 0.15) * 0.12;
  vec3 displaced = position + normal * noise;

  vec4 mvPosition = modelViewMatrix * vec4(displaced * uScale, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vNormal = normalMatrix * normal;
  vPosition = (modelMatrix * vec4(displaced * uScale, 1.0)).xyz;
  vViewDir = normalize(cameraPosition - vPosition);
}
`;

/* ───────────────────────────────────────────────────
   Fragment Shader
   ─────────────────────────────────────────────────── */
const fragmentShader = /* glsl */ `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
uniform vec3 uColor;
uniform float uEmissive;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDir;

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  // Fresnel rim glow → blends to void at silhouette
  float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 2.5);
  vec3 voidColor = vec3(0.039, 0.043, 0.063); // ≈ #0A0B10

  // Base surface color
  vec3 baseColor = uColor;

  // Secondary hot-spot highlight (drifting pearl-light)
  float hotspot = snoise(vPosition * 1.8 + vec3(uTime * 0.1, uTime * 0.07, uTime * -0.05));
  hotspot = smoothstep(0.15, 0.65, hotspot);
  vec3 highlightColor = baseColor + vec3(0.25, 0.22, 0.30);
  vec3 surface = mix(baseColor, highlightColor, hotspot * 0.4);

  // Apply emissive intensity (breathing)
  surface *= (0.85 + uEmissive * 0.35);

  // Blend fresnel rim toward void (orb emerges from darkness)
  vec3 finalColor = mix(surface, voidColor, fresnel * 0.75);

  // Add subtle rim emission at the edge for bloom pickup
  float rimEmission = pow(fresnel, 1.5) * 0.5;
  finalColor += uColor * rimEmission * uEmissive;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

/* ───────────────────────────────────────────────────
   Color palette (deeper, desaturated orb variants)
   ─────────────────────────────────────────────────── */
const ORB_COLORS: [THREE.Color, THREE.Color, THREE.Color] = [
  new THREE.Color("#463CC2"), // listening — deeper indigo
  new THREE.Color("#13897E"), // recalling — deeper teal
  new THREE.Color("#D85A3C"), // delivering — deeper coral
];

/* ───────────────────────────────────────────────────
   OrbMesh — the actual Three.js mesh rendered inside Canvas
   ─────────────────────────────────────────────────── */
function OrbMesh({ orbRadius }: { orbRadius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const { targetAnchor, colorState, setOrbScreenPos } = useOrb();
  const anchors = useOrbAnchors();

  // Refs for smooth lerping (avoid re-render churn)
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetColor = useRef(new THREE.Color(ORB_COLORS[0]));
  const currentColor = useRef(new THREE.Color(ORB_COLORS[0]));
  const initialised = useRef(false);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(ORB_COLORS[0]) },
      uScale: { value: 1.0 },
      uEmissive: { value: 1.0 },
    }),
    []
  );

  // Update target position when anchor or anchors map changes
  useEffect(() => {
    const anchor = anchors[targetAnchor];
    if (!anchor) return;
    const [wx, wy, wz] = viewportToWorld(anchor.x, anchor.y, size.width, size.height);
    targetPos.current.set(wx, wy, wz);

    // On first anchor hit, snap instead of lerp
    if (!initialised.current) {
      currentPos.current.copy(targetPos.current);
      if (meshRef.current) {
        meshRef.current.position.copy(currentPos.current);
      }
      initialised.current = true;
    }
  }, [anchors, targetAnchor, size.width, size.height]);

  // Update target color when colorState changes
  useEffect(() => {
    targetColor.current.copy(ORB_COLORS[colorState]);
  }, [colorState]);

  // Per-frame animation loop
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const mat = meshRef.current.material as THREE.ShaderMaterial;

    // Time uniform
    mat.uniforms.uTime.value = t;

    // Idle breathing: ~4s sine wave
    const breathe = Math.sin(t * (Math.PI * 2 / 4)); // period = 4s
    mat.uniforms.uScale.value = 1.0 + 0.04 * breathe;
    mat.uniforms.uEmissive.value = 0.85 + 0.15 * (breathe * 0.5 + 0.5);

    // Smooth position lerp (~6% per frame for 60fps ≈ 200ms feel)
    currentPos.current.lerp(targetPos.current, 0.06);
    meshRef.current.position.copy(currentPos.current);

    // Smooth color lerp
    currentColor.current.lerp(targetColor.current, 0.04);
    mat.uniforms.uColor.value.copy(currentColor.current);

    // Report projected screen position back to context (for connector lines)
    const projected = currentPos.current.clone();
    projected.x = (projected.x / (size.width / 2)) * 0.5 + 0.5;
    projected.y = -(projected.y / (size.height / 2)) * 0.5 + 0.5;
    const screenX = projected.x * size.width;
    const screenY = projected.y * size.height;
    setOrbScreenPos(
      Math.round(screenX),
      Math.round(screenY)
    );
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[orbRadius, 4]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
}

/* ───────────────────────────────────────────────────
   CoreCanvas — the public component mounted in root layout
   ─────────────────────────────────────────────────── */
export default function CoreCanvas() {
  const [shouldRender, setShouldRender] = useState(false);
  const [orbRadius, setOrbRadius] = useState(140);

  useEffect(() => {
    // Gate: no WebGL on mobile, reduced motion, or missing context
    const isMobile = window.innerWidth < 768;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Quick WebGL probe
    let hasWebGL = false;
    try {
      const testCanvas = document.createElement("canvas");
      hasWebGL = !!(
        testCanvas.getContext("webgl2") || testCanvas.getContext("webgl")
      );
    } catch {
      hasWebGL = false;
    }

    if (!isMobile && !prefersReduced && hasWebGL) {
      setShouldRender(true);
    }

    // Responsive orb size
    const updateSize = () => {
      const vw = window.innerWidth;
      if (vw >= 1280) setOrbRadius(160);
      else if (vw >= 1024) setOrbRadius(140);
      else setOrbRadius(120);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
      aria-hidden="true"
    >
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        orthographic
        camera={{ near: 0.1, far: 2000, position: [0, 0, 500] }}
        onCreated={({ camera, size }) => {
          const cam = camera as THREE.OrthographicCamera;
          cam.left = -size.width / 2;
          cam.right = size.width / 2;
          cam.top = size.height / 2;
          cam.bottom = -size.height / 2;
          cam.updateProjectionMatrix();
        }}
        resize={{ scroll: false }}
        style={{ background: "transparent" }}
      >
        <CameraSync />
        <OrbMesh orbRadius={orbRadius} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            intensity={0.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/** Keep orthographic camera bounds synced with viewport on resize */
function CameraSync() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = -size.width / 2;
    cam.right = size.width / 2;
    cam.top = size.height / 2;
    cam.bottom = -size.height / 2;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
