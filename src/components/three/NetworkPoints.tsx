"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { NetworkNode } from "./network-geometry";

const VERTEX_SHADER = /* glsl */ `
  attribute float aReveal;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vReveal;

  void main() {
    vReveal = aReveal;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Camera sits ~4-8 units from these points; this constant targets a
    // ~4-9px CSS point size at that range (was 280.0 — nearly 40x too big,
    // blowing every point out into one giant overlapping blob).
    gl_PointSize = aSize * uPixelRatio * (7.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uCoreColor;
  uniform vec3 uGlowColor;
  varying float vReveal;

  void main() {
    if (vReveal > uProgress) discard;

    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // smoothstep requires edge0 < edge1 (GLSL spec: undefined otherwise —
    // some drivers silently return 0), so invert via 1.0 - x rather than
    // swapping the edge arguments.
    float core = 1.0 - smoothstep(0.0, 0.16, dist);
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    vec3 color = mix(uGlowColor, uCoreColor, core);

    float appear = smoothstep(uProgress - 0.14, uProgress, vReveal);
    float alpha = glow * (1.0 - appear * 0.85);

    gl_FragColor = vec4(color, alpha);
  }
`;

interface NetworkPointsProps {
  nodes: NetworkNode[];
  progress: number;
  coreColor?: string;
  glowColor?: string;
  size?: number;
}

/** Renders the globe's nodes as soft glowing points via a small custom shader. */
export function NetworkPoints({
  nodes,
  progress,
  coreColor = "#ffffff",
  glowColor = "#1677ff",
  size = 6,
}: NetworkPointsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, reveals, sizes } = useMemo(() => {
    const positions = new Float32Array(nodes.length * 3);
    const reveals = new Float32Array(nodes.length);
    const sizes = new Float32Array(nodes.length);

    nodes.forEach((node, i) => {
      positions[i * 3] = node.position[0];
      positions[i * 3 + 1] = node.position[1];
      positions[i * 3 + 2] = node.position[2];
      reveals[i] = node.reveal;
      // Deterministic per-node size variation (avoids calling Math.random during render).
      const pseudoRandom = Math.abs(Math.sin(i * 12.9898)) % 1;
      sizes[i] = size * (0.6 + pseudoRandom * 0.8);
    });

    return { positions, reveals, sizes };
  }, [nodes, size]);

  // uProgress starts at 0 and is kept in sync every frame below — it's
  // intentionally excluded from the memo deps so this object (and its Color
  // instances) stays stable across the scroll-driven progress updates.
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
      uCoreColor: { value: new THREE.Color(coreColor) },
      uGlowColor: { value: new THREE.Color(glowColor) },
    }),
    [coreColor, glowColor],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aReveal" args={[reveals, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </points>
  );
}
