"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { NetworkEdge } from "./network-geometry";

const VERTEX_SHADER = /* glsl */ `
  attribute float aReveal;
  varying float vReveal;

  void main() {
    vReveal = aReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uColor;
  varying float vReveal;

  void main() {
    if (vReveal > uProgress) discard;
    float appear = smoothstep(uProgress - 0.16, uProgress, vReveal);
    gl_FragColor = vec4(uColor, 0.35 * (1.0 - appear * 0.9));
  }
`;

interface NetworkLinesProps {
  edges: NetworkEdge[];
  progress: number;
  color?: string;
}

/** Renders the thin great-circle connections between nodes. */
export function NetworkLines({ edges, progress, color = "#4c9aff" }: NetworkLinesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, reveals } = useMemo(() => {
    const positions = new Float32Array(edges.length * 6);
    const reveals = new Float32Array(edges.length * 2);

    edges.forEach((edge, i) => {
      positions.set(edge.positions, i * 6);
      reveals[i * 2] = edge.reveal;
      reveals[i * 2 + 1] = edge.reveal;
    });

    return { positions, reveals };
  }, [edges]);

  // uProgress starts at 0 and is kept in sync every frame below — see the
  // matching note in NetworkPoints.tsx.
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aReveal" args={[reveals, 1]} />
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
    </lineSegments>
  );
}
