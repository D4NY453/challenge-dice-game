"use client";

import React, { useEffect, useRef } from "react";

interface GlassCubeProps {
  isRolling?: boolean;
  className?: string;
  size?: number;
}

export const GlassCube: React.FC<GlassCubeProps> = ({ isRolling = true, className = "", size = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Maintain current rotation angles
  const rotationRef = useRef({ rx: 0.5, ry: 0.8, rz: 0.3 });
  // Maintain spin velocity
  const velocityRef = useRef({ vx: 0.06, vy: 0.09, vz: 0.04 });

  useEffect(() => {
    // Randomize initial rotation once on mount to keep rendering pure
    rotationRef.current = { rx: Math.random() * 2, ry: Math.random() * 2, rz: Math.random() * 2 };

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

    // 3D Cube Geometry (8 vertices)
    // Normalized to lie on a sphere of radius 1.0
    const s = 1.0 / Math.sqrt(3); // Normalize coordinates
    const vertices: [number, number, number][] = [
      [-s, -s, -s], // 0
      [s, -s, -s], // 1
      [s, s, -s], // 2
      [-s, s, -s], // 3
      [-s, -s, s], // 4
      [s, -s, s], // 5
      [s, s, s], // 6
      [-s, s, s], // 7
    ];

    // 6 square faces (represented as 2 triangles each for sorting)
    // Each face has 4 vertices: [v0, v1, v2, v3] and a label (1..6)
    const cubeFaces = [
      { name: "1", indices: [4, 5, 6, 7], color: "#ff007f" }, // Front (+Z)
      { name: "6", indices: [1, 0, 3, 2], color: "#a020f0" }, // Back (-Z)
      { name: "2", indices: [3, 2, 6, 7], color: "#00ffff" }, // Top (+Y)
      { name: "5", indices: [0, 1, 5, 4], color: "#ffff00" }, // Bottom (-Y)
      { name: "3", indices: [1, 2, 6, 5], color: "#ff8c00" }, // Right (+X)
      { name: "4", indices: [0, 3, 7, 4], color: "#00ff00" }, // Left (-X)
    ];

    // Render loop
    const render = () => {
      const center = size / 2;
      const scale = size * 0.38; // Ideal scale for cube
      const perspective = 3.5;

      ctx.clearRect(0, 0, size, size);

      // Update rotation angles
      if (isRolling) {
        rotationRef.current.rx = (rotationRef.current.rx + velocityRef.current.vx) % (Math.PI * 2);
        rotationRef.current.ry = (rotationRef.current.ry + velocityRef.current.vy) % (Math.PI * 2);
        rotationRef.current.rz = (rotationRef.current.rz + velocityRef.current.vz) % (Math.PI * 2);
      }

      const rx = rotationRef.current.rx;
      const ry = rotationRef.current.ry;
      const rz = rotationRef.current.rz;

      // Trigonometry for rotations
      const cx = Math.cos(rx),
        sx = Math.sin(rx);
      const cy = Math.cos(ry),
        sy = Math.sin(ry);
      const cz = Math.cos(rz),
        sz = Math.sin(rz);

      // Rotate and project vertices (Z -> Y -> X order)
      const projected = vertices.map(([x, y, z]) => {
        // 1. Rotate Z
        const x1 = x * cz - y * sz;
        const y1 = x * sz + y * cz;
        const z1 = z;

        // 2. Rotate Y
        const x2 = x1 * cy + z1 * sy;
        const y2 = y1;
        const z2 = -x1 * sy + z1 * cy;

        // 3. Rotate X
        const x3 = x2;
        const y3 = y2 * cx - z2 * sx;
        const z3 = y2 * sx + z2 * cx;

        // Project
        const factor = perspective / (perspective + z3);
        const px = center + x3 * scale * factor;
        const py = center - y3 * scale * factor;

        return { x: px, y: py, z: z3, ox: x3, oy: y3, oz: z3 };
      });

      // Compute faces centers and normals for depth sorting
      const faceData = cubeFaces.map((face, faceIdx) => {
        const [ia, ib, ic, id] = face.indices;
        const A = projected[ia];
        const B = projected[ib];
        const C = projected[ic];
        const D = projected[id];

        // 3D center of the face
        const cz = (A.z + B.z + C.z + D.z) / 4;

        // 2D center of the face on screen
        const cx_screen = (A.x + B.x + C.x + D.x) / 4;
        const cy_screen = (A.y + B.y + C.y + D.y) / 4;

        // Outward Normal vector using center of face
        const cox = (A.ox + B.ox + C.ox + D.ox) / 4;
        const coy = (A.oy + B.oy + C.oy + D.oy) / 4;
        const coz = (A.oz + B.oz + C.oz + D.oz) / 4;

        const len = Math.sqrt(cox * cox + coy * coy + coz * coz);
        const normalX = cox / len;
        const normalY = coy / len;
        const normalZ = coz / len; // Points towards camera if positive

        return {
          idx: faceIdx,
          face,
          ia,
          ib,
          ic,
          id,
          zDepth: cz,
          cxScreen: cx_screen,
          cyScreen: cy_screen,
          normalZ,
          normalX,
          normalY,
        };
      });

      // Sort faces by depth (back to front)
      faceData.sort((a, b) => b.zDepth - a.zDepth);

      // Render faces
      faceData.forEach(f => {
        const A = projected[f.ia];
        const B = projected[f.ib];
        const C = projected[f.ic];
        const D = projected[f.id];

        const isFront = f.normalZ > 0.15;

        // Draw face path (quadrilateral)
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();

        if (isFront) {
          // Glass reflection gradient on front faces
          const reflectionX = center + f.normalX * scale * 0.4;
          const reflectionY = center - f.normalY * scale * 0.4;
          const grad = ctx.createRadialGradient(reflectionX, reflectionY, scale * 0.1, center, center, scale * 1.5);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          grad.addColorStop(0.3, "rgba(255, 255, 255, 0.08)");
          grad.addColorStop(0.7, "rgba(245, 179, 36, 0.03)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.45)");

          ctx.fillStyle = grad;
          ctx.fill();

          // Inner outline
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1.0;
          ctx.stroke();
        } else {
          // Faint back glass wall
          ctx.fillStyle = "rgba(245, 179, 36, 0.01)";
          ctx.fill();
        }

        // Draw outer borders
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();

        ctx.strokeStyle = isFront ? "rgba(245, 179, 36, 0.45)" : "rgba(245, 179, 36, 0.1)";
        ctx.lineWidth = isFront ? 1.5 : 0.8;
        ctx.stroke();

        // Render face numbers (1..6)
        if (isFront) {
          ctx.save();

          const tx = f.cxScreen;
          const ty = f.cyScreen;

          // Multicolor linear gradient for the numbers
          const textGrad = ctx.createLinearGradient(tx - 12, ty - 12, tx + 12, ty + 12);
          textGrad.addColorStop(0, "#ff007f"); // Neon Pink
          textGrad.addColorStop(0.5, "#00ffff"); // Cyan
          textGrad.addColorStop(1, "#ffff00"); // Yellow/Gold

          // Set text styles
          ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Text Glow shadow
          ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText(f.face.name, tx, ty);

          ctx.shadowColor = "rgba(255, 0, 127, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillStyle = textGrad;
          ctx.fillText(f.face.name, tx, ty);

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRolling, size]);

  return (
    <div className={`relative flex items-center justify-center bg-transparent ${className}`}>
      {/* Outer spinning light ring */}
      <div className="absolute w-[80px] h-[80px] rounded-full border border-dashed border-primary/20 animate-spin pointer-events-none opacity-30 blur-[1px]" />
      <canvas ref={canvasRef} className="block pointer-events-none relative z-10" />
    </div>
  );
};
