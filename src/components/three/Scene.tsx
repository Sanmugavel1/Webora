"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildNetworkGraph } from "./network-geometry";
import { NetworkPoints } from "./NetworkPoints";
import { NetworkLines } from "./NetworkLines";

interface SceneProps {
  nodeCount: number;
  neighbors: number;
  withReveal: boolean;
  progress: number;
  spin: boolean;
  parallax: boolean;
  rotateSpeed?: number;
}

export function Scene({
  nodeCount,
  neighbors,
  withReveal,
  progress,
  spin,
  parallax,
  rotateSpeed = 0.045,
}: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes, edges } = useMemo(
    () => buildNetworkGraph({ count: nodeCount, radius: 2.1, neighbors, withReveal }),
    [nodeCount, neighbors, withReveal],
  );

  const targetTilt = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;

    if (spin) {
      group.current.rotation.y += delta * rotateSpeed;
    }

    if (parallax) {
      targetTilt.current.x = state.pointer.y * 0.18;
      targetTilt.current.y = state.pointer.x * 0.22;
      group.current.rotation.x += (targetTilt.current.x - group.current.rotation.x) * 0.04;
      group.current.rotation.z += (targetTilt.current.y - group.current.rotation.z) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={40} color="#1677ff" />
      <pointLight position={[-4, -2, -4]} intensity={18} color="#4c9aff" />
      <group ref={group} rotation={[0.15, 0.4, 0]}>
        <NetworkPoints nodes={nodes} progress={progress} />
        <NetworkLines edges={edges} progress={progress} />
      </group>
    </>
  );
}
