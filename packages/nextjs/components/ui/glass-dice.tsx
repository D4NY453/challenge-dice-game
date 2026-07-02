"use client";

import React, { useEffect, useRef } from "react";

interface GlassDiceProps {
  value?: string | number;
  isRolling?: boolean;
  className?: string;
  size?: number;
}

export const GlassDice: React.FC<GlassDiceProps> = ({ value = "0", isRolling = false, className = "", size = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Maintain current rotation angles
  const rotationRef = useRef({ rx: 0.5, ry: 0.8, rz: 0.3 });
  // Maintain spin velocity
  const velocityRef = useRef({ vx: 0.08, vy: 0.12, vz: 0.05 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas dimensions with device pixel ratio
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Regular Icosahedron Geometry (20 faces, 12 vertices)
    // Normalized to unit sphere of radius 1.0
    const t = (1 + Math.sqrt(5)) / 2;
    const r = Math.sqrt(1 + t * t);

    const vertices: [number, number, number][] = [
      [-1 / r, t / r, 0], // 0
      [1 / r, t / r, 0], // 1
      [-1 / r, -t / r, 0], // 2
      [1 / r, -t / r, 0], // 3

      [0, -1 / r, t / r], // 4
      [0, 1 / r, t / r], // 5
      [0, -1 / r, -t / r], // 6
      [0, 1 / r, -t / r], // 7

      [t / r, 0, -1 / r], // 8
      [t / r, 0, 1 / r], // 9
      [-t / r, 0, -1 / r], // 10
      [-t / r, 0, 1 / r], // 11
    ];

    // 20 triangular faces
    const faces: [number, number, number][] = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],

      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],

      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],

      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ];

    // 20 labels: 16 hex digits (0..F) + 4 decorative gaming symbols
    const faceLabels = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "🎲",
      "★",
      "⚡",
      "✨",
    ];

    // Find face index from string value
    const valStr = String(value).toUpperCase().trim();
    let targetFaceIndex = faceLabels.indexOf(valStr);
    if (targetFaceIndex === -1 || targetFaceIndex >= 16) {
      targetFaceIndex = 0;
    }

    // Helper to calculate face normal in local space
    const getFaceNormal = (faceIdx: number): [number, number, number] => {
      const [ia, ib, ic] = faces[faceIdx];
      const A = vertices[ia];
      const B = vertices[ib];
      const C = vertices[ic];

      // Vectors AB and AC
      const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      const ac = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];

      // Cross product (normal vector)
      let nx = ab[1] * ac[2] - ab[2] * ac[1];
      let ny = ab[2] * ac[0] - ab[0] * ac[2];
      let nz = ab[0] * ac[1] - ab[1] * ac[0];

      // Local face center
      const cx = (A[0] + B[0] + C[0]) / 3;
      const cy = (A[1] + B[1] + C[1]) / 3;
      const cz = (A[2] + B[2] + C[2]) / 3;

      // Ensure normal points OUTWARDS
      if (nx * cx + ny * cy + nz * cz < 0) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      return [nx / len, ny / len, nz / len];
    };

    // Math helper to get target angles where faceIndex faces the camera directly
    const getTargetAngles = (faceIdx: number) => {
      const normal = getFaceNormal(faceIdx);

      // Solve for Y rotation (alpha) and X rotation (beta) to align normal with [0, 0, 1]
      const alpha = -Math.atan2(normal[0], normal[2]);
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      const ny_rot = normal[1];
      const nz_rot = -normal[0] * sinA + normal[2] * cosA;
      const beta = Math.atan2(ny_rot, nz_rot);

      return { rx: beta, ry: alpha, rz: 0 };
    };

    // Interpolation angle helper
    const diffAngle = (target: number, current: number) => {
      let diff = (target - current) % (Math.PI * 2);
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      return diff;
    };

    // Render loop
    const render = () => {
      const center = size / 2;
      const scale = size * 0.36; // Ideal scale for regular 1.0 radius icosahedron
      const perspective = 3.5;

      ctx.clearRect(0, 0, size, size);

      // 1. Update rotation angles
      if (isRolling) {
        // High speed chaotic spin
        velocityRef.current.vx = 0.15 + Math.sin(Date.now() * 0.005) * 0.05;
        velocityRef.current.vy = 0.22 + Math.cos(Date.now() * 0.007) * 0.04;
        velocityRef.current.vz = 0.1 + Math.sin(Date.now() * 0.003) * 0.03;

        rotationRef.current.rx = (rotationRef.current.rx + velocityRef.current.vx) % (Math.PI * 2);
        rotationRef.current.ry = (rotationRef.current.ry + velocityRef.current.vy) % (Math.PI * 2);
        rotationRef.current.rz = (rotationRef.current.rz + velocityRef.current.vz) % (Math.PI * 2);
      } else {
        // Smoothly target the face index rotation
        const target = getTargetAngles(targetFaceIndex);
        rotationRef.current.rx += diffAngle(target.rx, rotationRef.current.rx) * 0.12;
        rotationRef.current.ry += diffAngle(target.ry, rotationRef.current.ry) * 0.12;
        rotationRef.current.rz += diffAngle(target.rz, rotationRef.current.rz) * 0.12;
      }

      const rx = rotationRef.current.rx;
      const ry = rotationRef.current.ry;
      const rz = rotationRef.current.rz;

      // 2. Trigonometry for rotations
      const cx = Math.cos(rx),
        sx = Math.sin(rx);
      const cy = Math.cos(ry),
        sy = Math.sin(ry);
      const cz = Math.cos(rz),
        sz = Math.sin(rz);

      // Rotate and project vertices (Z -> Y -> X order)
      const projected = vertices.map(([x, y, z]) => {
        // 1. Rotate Z
        let x1 = x * cz - y * sz;
        let y1 = x * sz + y * cz;
        let z1 = z;

        // 2. Rotate Y
        let x2 = x1 * cy + z1 * sy;
        let y2 = y1;
        let z2 = -x1 * sy + z1 * cy;

        // 3. Rotate X
        let x3 = x2;
        let y3 = y2 * cx - z2 * sx;
        let z3 = y2 * sx + z2 * cx;

        // Project
        const factor = perspective / (perspective + z3);
        const px = center + x3 * scale * factor;
        const py = center - y3 * scale * factor;

        return { x: px, y: py, z: z3, ox: x3, oy: y3, oz: z3 };
      });

      // 3. Compute faces centers and normals for depth sorting
      const faceData = faces.map(([ia, ib, ic], idx) => {
        const A = projected[ia];
        const B = projected[ib];
        const C = projected[ic];

        // 3D center of the face
        const cz = (A.z + B.z + C.z) / 3;

        // 2D center of the face on screen
        const cx_screen = (A.x + B.x + C.x) / 3;
        const cy_screen = (A.y + B.y + C.y) / 3;

        // Outward Normal vector after rotation (AC x AB)
        const ab = [B.ox - A.ox, B.oy - A.oy, B.oz - A.oz];
        const ac = [C.ox - A.ox, C.oy - A.oy, C.oz - A.oz];
        let nx = ac[1] * ab[2] - ac[2] * ab[1];
        let ny = ac[2] * ab[0] - ac[0] * ab[2];
        let nz = ac[0] * ab[1] - ac[1] * ab[0];

        // Face center in local coordinates before rotation
        const localA = vertices[ia];
        const localB = vertices[ib];
        const localC = vertices[ic];
        const lcx = (localA[0] + localB[0] + localC[0]) / 3;
        const lcy = (localA[1] + localB[1] + localC[1]) / 3;
        const lcz = (localA[2] + localB[2] + localC[2]) / 3;

        // Safer: normal dot rotated center (ox, oy, oz) should be positive!
        const cox = (A.ox + B.ox + C.ox) / 3;
        const coy = (A.oy + B.oy + C.oy) / 3;
        const coz = (A.oz + B.oz + C.oz) / 3;
        if (nx * cox + ny * coy + nz * coz < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        return {
          idx,
          ia,
          ib,
          ic,
          zDepth: cz,
          cxScreen: cx_screen,
          cyScreen: cy_screen,
          normalZ: nz / len,
          normalX: nx / len,
          normalY: ny / len,
        };
      });

      // Sort faces by depth (back to front)
      faceData.sort((a, b) => b.zDepth - a.zDepth);

      // 4. Render faces
      faceData.forEach(face => {
        const A = projected[face.ia];
        const B = projected[face.ib];
        const C = projected[face.ic];

        const isFront = face.normalZ > 0.05;

        // Draw face path
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.closePath();

        if (isFront) {
          // Glass reflection gradient on front faces
          const reflectionX = center + face.normalX * scale * 0.4;
          const reflectionY = center - face.normalY * scale * 0.4;
          const grad = ctx.createRadialGradient(reflectionX, reflectionY, scale * 0.1, center, center, scale * 1.5);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          grad.addColorStop(0.3, "rgba(255, 255, 255, 0.08)");
          grad.addColorStop(0.7, "rgba(245, 179, 36, 0.04)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");

          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle inner reflection line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 1.0;
          ctx.stroke();
        } else {
          // Faint back glass wall
          ctx.fillStyle = "rgba(245, 179, 36, 0.015)";
          ctx.fill();
        }

        // Draw outer wireframe edges
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.closePath();

        // Front edges are bright gold, back edges are faint amber
        ctx.strokeStyle = isFront ? "rgba(245, 179, 36, 0.45)" : "rgba(245, 179, 36, 0.12)";
        ctx.lineWidth = isFront ? 1.5 : 0.8;
        ctx.stroke();

        // Render face numbers
        if (isFront) {
          const label = faceLabels[face.idx];

          ctx.save();

          // Center coordinates on screen
          const tx = face.cxScreen;
          const ty = face.cyScreen;

          // Multicolor linear gradient for the numbers
          const textGrad = ctx.createLinearGradient(tx - 16, ty - 16, tx + 16, ty + 16);
          textGrad.addColorStop(0, "#ff007f"); // Neon Pink
          textGrad.addColorStop(0.3, "#a020f0"); // Purple
          textGrad.addColorStop(0.6, "#00ffff"); // Cyan
          textGrad.addColorStop(1, "#ffff00"); // Yellow/Gold

          // Set text styles
          ctx.font = "bold 24px 'Space Grotesk', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Text Glow shadow
          ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
          ctx.shadowBlur = 10;

          // Draw double shadow for intense neon glow
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText(label, tx, ty);

          ctx.shadowColor = "rgba(255, 0, 127, 0.85)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = textGrad;
          ctx.fillText(label, tx, ty);

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, isRolling, size]);

  return (
    <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
      {/* Outer spinning light ring for extra premium visual punch */}
      <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-primary/25 animate-spin pointer-events-none opacity-40 blur-[1px]" />
      <div className="absolute w-[280px] h-[280px] rounded-full border border-double border-secondary/15 animate-spin pointer-events-none opacity-20 duration-1000" />
      <canvas ref={canvasRef} className="block pointer-events-none relative z-10" />
    </div>
  );
};
