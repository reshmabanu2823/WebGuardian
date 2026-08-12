import React, { useEffect, useRef, useState } from 'react';

interface SpiderWebBackgroundProps {
  opacity?: number;
  interactive?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

export const SpiderWebBackground: React.FC<SpiderWebBackgroundProps> = ({
  opacity = 0.65,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webDensity, setWebDensity] = useState<'STANDARD' | 'HIGH' | 'TACTICAL'>('STANDARD');
  const [showCornerWebs, setShowCornerWebs] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180, // Distance mouse attaches web strands
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('touchmove', handleTouchMove);
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Node count based on screen area & density mode
    let nodeCount = Math.floor((width * height) / 14000);
    if (webDensity === 'HIGH') nodeCount = Math.floor((width * height) / 8000);
    if (webDensity === 'TACTICAL') nodeCount = Math.floor((width * height) / 18000);

    const colors = [
      'rgba(150, 35, 51, ',   // Dark Red
      'rgba(255, 59, 83, ',   // Neon Marvel Crimson
      'rgba(255, 179, 181, ', // Bright Rose Glow
      'rgba(222, 191, 191, ', // Neutral Muted Tech
    ];

    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const count = Math.min(Math.max(nodeCount, 40), 120);
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 2 + 1.2;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius,
          baseRadius: radius,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initNodes();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle radial spider web grid background overlay
      const maxDist = webDensity === 'HIGH' ? 160 : 130;

      // Update and draw web nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Move nodes
        n.x += n.vx;
        n.y += n.vy;

        // Bounce on boundaries
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Subtle pulsing glow size
        n.pulsePhase += n.pulseSpeed;
        const currentRadius = n.baseRadius + Math.sin(n.pulsePhase) * 0.8;

        // Draw Node Dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}0.9)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff3b53';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Connect nodes to create Spider Web Mesh
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);

            // Draw elastic web curvature (subtle curve for Marvel web effect)
            const midX = (n.x + n2.x) / 2 + Math.sin(n.pulsePhase) * 2;
            const midY = (n.y + n2.y) / 2 + Math.cos(n.pulsePhase) * 2;
            ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);

            // Line style
            ctx.strokeStyle = `rgba(255, 90, 110, ${alpha})`;
            ctx.lineWidth = dist < maxDist * 0.4 ? 1.2 : 0.6;
            ctx.stroke();
          }
        }

        // Mouse Web Interaction - Attach dynamic web strands to cursor
        if (interactive && mouse.x > 0 && mouse.y > 0) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            const mAlpha = (1 - mdist / mouse.radius) * 0.8;

            // Elastic web pull effect toward cursor
            n.x -= (mdx / mdist) * 0.4;
            n.y -= (mdy / mdist) * 0.4;

            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 179, 181, ${mAlpha})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // Glow around cursor anchor
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 59, 83, 0.8)';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff3b53';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [webDensity, interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity }}>
      {/* Dynamic Spider Web Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Marvel Tech HUD Spider-Web Radial Corner Graphics */}
      {showCornerWebs && (
        <>
          {/* Top-Left Marvel Spider Web HUD Corner */}
          <div className="absolute top-0 left-0 w-64 h-64 opacity-30 sm:opacity-45 pointer-events-none transform -translate-x-10 -translate-y-10">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#ff3b53]">
              {/* Radial Web Concentric Rings */}
              <circle cx="0" cy="0" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="0" cy="0" r="80" stroke="currentColor" strokeWidth="1" />
              <circle cx="0" cy="0" r="120" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2" />
              <circle cx="0" cy="0" r="160" stroke="currentColor" strokeWidth="1" />
              <circle cx="0" cy="0" r="190" stroke="#962333" strokeWidth="1.5" />

              {/* Radial Web Strands (Spider Spikes) */}
              <line x1="0" y1="0" x2="200" y2="0" stroke="currentColor" strokeWidth="1.2" />
              <line x1="0" y1="0" x2="190" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="160" y2="120" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="120" y2="160" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="60" y2="190" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="200" stroke="currentColor" strokeWidth="1.2" />

              {/* Spider-Web Curved Strands between rays */}
              <path d="M 0 40 Q 25 35 38 12 M 0 80 Q 50 70 76 24 M 0 120 Q 75 105 114 36 M 0 160 Q 100 140 152 48" stroke="#ffb3b5" strokeWidth="0.8" />
              <path d="M 38 12 Q 35 25 12 38 M 76 24 Q 70 50 24 76 M 114 36 Q 105 75 36 114 M 152 48 Q 140 100 48 152" stroke="#ffb3b5" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Top-Right Marvel Spider Web HUD Corner */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-30 sm:opacity-45 pointer-events-none transform translate-x-10 -translate-y-10 scale-x-[-1]">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#ff3b53]">
              <circle cx="0" cy="0" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="0" cy="0" r="80" stroke="currentColor" strokeWidth="1" />
              <circle cx="0" cy="0" r="120" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="160" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="200" y2="0" stroke="currentColor" strokeWidth="1.2" />
              <line x1="0" y1="0" x2="160" y2="120" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="120" y2="160" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="200" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 0 40 Q 25 35 38 12 M 0 80 Q 50 70 76 24 M 0 120 Q 75 105 114 36" stroke="#ffb3b5" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Bottom-Right Marvel Tactical Spider-Web Central Hub Graphic */}
          <div className="absolute bottom-4 right-4 z-30 pointer-events-auto flex items-center gap-2 bg-[#1c1011]/80 backdrop-blur-md border border-[#574142] px-3 py-1.5 rounded-full font-mono-tech text-[10px] text-[#ffb3b5] shadow-xl">
            <span className="w-2 h-2 bg-[#ff3b53] rounded-full animate-ping" />
            <span className="font-bold tracking-wider">WEB MESH:</span>
            <button
              onClick={() =>
                setWebDensity((prev) =>
                  prev === 'STANDARD' ? 'HIGH' : prev === 'HIGH' ? 'TACTICAL' : 'STANDARD'
                )
              }
              className="bg-[#291d1d] hover:bg-[#342727] text-white px-2 py-0.5 rounded-xs border border-[#962333] uppercase transition-colors"
            >
              {webDensity}
            </button>
            <button
              onClick={() => setShowCornerWebs(!showCornerWebs)}
              className="text-[#debfbf] hover:text-white transition-colors ml-1"
              title="Toggle Corner Web Latices"
            >
              {showCornerWebs ? '🕸️ WEB ON' : '🕸️ WEB OFF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
