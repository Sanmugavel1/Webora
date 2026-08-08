/**
 * Pure math helpers for the WEBORA network-globe visual. No DOM/React/Three
 * imports here beyond the lightweight Vector3 type, so this stays easy to
 * unit-reason-about and cheap to import anywhere.
 */

export interface NetworkNode {
  position: [number, number, number];
  /** Normalized angular distance (0 = origin node, 1 = antipode). */
  reveal: number;
}

export interface NetworkEdge {
  /** Two endpoints as flat [x1,y1,z1,x2,y2,z2]. */
  positions: [number, number, number, number, number, number];
  reveal: number;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

/** Evenly distributes `count` points on a unit sphere (golden-angle spiral). */
function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 -> -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push([x * radius, y * radius, z * radius]);
  }

  return points;
}

function distance(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

interface BuildNetworkGraphOptions {
  count: number;
  radius: number;
  /** How many nearest neighbors each node connects to. */
  neighbors: number;
  /**
   * When true, `reveal` is measured as angular distance from the node
   * nearest to (0, 0, radius) — used by the signature "local to global"
   * scroll reveal. When false, every node/edge gets reveal = 0 (always on).
   */
  withReveal: boolean;
}

/** Builds a deterministic point/edge network used across the hero, signature and CTA visuals. */
export function buildNetworkGraph({
  count,
  radius,
  neighbors,
  withReveal,
}: BuildNetworkGraphOptions): NetworkGraph {
  const points = fibonacciSphere(count, radius);

  let originIndex = 0;
  if (withReveal) {
    const front: [number, number, number] = [0, 0, radius];
    let best = Infinity;
    points.forEach((p, i) => {
      const d = distance(p, front);
      if (d < best) {
        best = d;
        originIndex = i;
      }
    });
  }

  const origin = points[originIndex];
  const maxAngle = Math.PI * radius; // roughly the max great-circle distance
  const reveal: number[] = points.map((p) => {
    if (!withReveal) return 0;
    const d = distance(p, origin);
    return Math.min(1, d / maxAngle);
  });

  const nodes: NetworkNode[] = points.map((position, i) => ({
    position,
    reveal: reveal[i],
  }));

  // Nearest-neighbor edges (O(n^2) — fine at the node counts we use, <260).
  const edgeSet = new Set<string>();
  const edges: NetworkEdge[] = [];

  points.forEach((p, i) => {
    const distances = points
      .map((q, j) => ({ j, d: i === j ? Infinity : distance(p, q) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, neighbors);

    distances.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      const q = points[j];
      edges.push({
        positions: [p[0], p[1], p[2], q[0], q[1], q[2]],
        reveal: Math.max(reveal[i], reveal[j]),
      });
    });
  });

  return { nodes, edges };
}
