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

interface WebPulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export const SpiderWebBackground: React.FC<SpiderWebBackgroundProps> = ({
  opacity = 0.85,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webDensity, setWebDensity] = useState<'STANDARD' | 'HIGH' | 'TACTICAL' | 'HYPER-WEB'>('TACTICAL');
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
      radius: 220, // Distance mouse attaches web strands
      clickPulse: 0
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

    const handleClick = (e: MouseEvent) => {
      mouse.clickPulse = 1.0;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('click', handleClick);
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Node count calculation
    let densityDivider = 12000;
    if (webDensity === 'HIGH') densityDivider = 8000;
    if (webDensity === 'TACTICAL') densityDivider = 10000;
    if (webDensity === 'HYPER-WEB') densityDivider = 5000;

    const colors = [
      'rgba(150, 35, 51, ',   // Deep Maroon
      'rgba(163, 38, 51, ',   // Crimson Primary
      'rgba(255, 77, 95, ',   // Neon Crimson Web Accent
      'rgba(255, 179, 181, ', // Glowing Silk Web Rose
    ];

    let nodes: Node[] = [];
    let pulses: WebPulse[] = [];

    const initNodes = () => {
      nodes = [];
      const calculatedCount = Math.floor((width * height) / densityDivider);
      const count = Math.min(Math.max(calculatedCount, 45), 140);
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 2.2 + 1.5;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius,
          baseRadius: radius,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initNodes();

    // Periodically send electrical pulses along spider web strands
    const pulseInterval = setInterval(() => {
      if (nodes.length > 2) {
        const i1 = Math.floor(Math.random() * nodes.length);
        let i2 = Math.floor(Math.random() * nodes.length);
        if (i1 !== i2) {
          pulses.push({
            fromNode: i1,
            toNode: i2,
            progress: 0,
            speed: 0.02 + Math.random() * 0.03,
          });
        }
      }
    }, 800);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDist = webDensity === 'HYPER-WEB' ? 190 : webDensity === 'HIGH' ? 160 : 140;

      // Click ripple decay
      if (mouse.clickPulse > 0) {
        mouse.clickPulse -= 0.02;
      }

      // 1. Draw web nodes and web mesh lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Move nodes
        n.x += n.vx;
        n.y += n.vy;

        // Bounce on screen edges
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Pulsing dot size
        n.pulsePhase += n.pulseSpeed;
        const currentRadius = n.baseRadius + Math.sin(n.pulsePhase) * 1.0;

        // Draw Web Node Dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}0.95)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#A32633';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nodes to form Spider-Web Mesh
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.55;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);

            // Curve spider web strands with subtle sine wave oscillation
            const midX = (n.x + n2.x) / 2 + Math.sin(n.pulsePhase + i) * 3;
            const midY = (n.y + n2.y) / 2 + Math.cos(n.pulsePhase + j) * 3;
            ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);

            // Web line style
            ctx.strokeStyle = `rgba(255, 90, 110, ${alpha})`;
            ctx.lineWidth = dist < maxDist * 0.35 ? 1.4 : 0.7;
            ctx.stroke();
          }
        }

        // 2. Dynamic Mouse Interaction - Magnetically attract & string silk web to cursor
        if (interactive && mouse.x > 0 && mouse.y > 0) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            const mAlpha = (1 - mdist / mouse.radius) * 0.85;

            // Elastic web pull effect towards cursor
            n.x -= (mdx / mdist) * 0.6;
            n.y -= (mdy / mdist) * 0.6;

            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 179, 181, ${mAlpha})`;
            ctx.lineWidth = 1.6;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff4d5f';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 3. Draw mouse cursor web hub glow & ripple shockwave
      if (interactive && mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 77, 95, 0.9)';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#A32633';
        ctx.fill();
        ctx.shadowBlur = 0;

        if (mouse.clickPulse > 0) {
          const rippleRadius = (1 - mouse.clickPulse) * 180;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 179, 181, ${mouse.clickPulse * 0.8})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 4. Animate electrical signal pulses traveling across web strands
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const n1 = nodes[pulse.fromNode];
        const n2 = nodes[pulse.toNode];
        if (n1 && n2) {
          const px = n1.x + (n2.x - n1.x) * pulse.progress;
          const py = n1.y + (n2.y - n1.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffb3b5';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ff4d5f';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('click', handleClick);
      }
    };
  }, [webDensity, interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity }}>
      {/* Dynamic Spider Web Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Futuristic Spider Web Tactical Corner Graphics */}
      {showCornerWebs && (
        <>
          {/* Top-Left Spider Web Radial Corner */}
          <div className="absolute top-0 left-0 w-72 h-72 opacity-40 sm:opacity-55 pointer-events-none transform -translate-x-12 -translate-y-12 transition-opacity">
            <svg viewBox="0 0 240 240" fill="none" className="w-full h-full text-[#A32633]">
              {/* Radial Web Concentric Rings */}
              <circle cx="0" cy="0" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="90" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="135" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 2" />
              <circle cx="0" cy="0" r="180" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="220" stroke="#ff4d5f" strokeWidth="1.8" />

              {/* Spider-Web Spikes */}
              <line x1="0" y1="0" x2="240" y2="0" stroke="currentColor" strokeWidth="1.4" />
              <line x1="0" y1="0" x2="220" y2="80" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="180" y2="150" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="150" y2="180" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="80" y2="220" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="240" stroke="currentColor" strokeWidth="1.4" />

              {/* Spider-Web Elastic Arcs between rays */}
              <path d="M 0 45 Q 30 40 45 15 M 0 90 Q 60 80 90 30 M 0 135 Q 90 120 135 45 M 0 180 Q 120 160 180 60" stroke="#ffb3b5" strokeWidth="1" />
              <path d="M 45 15 Q 40 30 15 45 M 90 30 Q 80 60 30 90 M 135 45 Q 120 90 45 135 M 180 60 Q 160 120 60 180" stroke="#ffb3b5" strokeWidth="1" />
            </svg>
          </div>

          {/* Top-Right Spider Web Radial Corner */}
          <div className="absolute top-0 right-0 w-72 h-72 opacity-40 sm:opacity-55 pointer-events-none transform translate-x-12 -translate-y-12 scale-x-[-1] transition-opacity">
            <svg viewBox="0 0 240 240" fill="none" className="w-full h-full text-[#A32633]">
              <circle cx="0" cy="0" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="90" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="135" stroke="currentColor" strokeWidth="0.9" />
              <circle cx="0" cy="0" r="180" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="220" stroke="#ff4d5f" strokeWidth="1.8" />
              <line x1="0" y1="0" x2="240" y2="0" stroke="currentColor" strokeWidth="1.4" />
              <line x1="0" y1="0" x2="180" y2="150" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="150" y2="180" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="240" stroke="currentColor" strokeWidth="1.4" />
              <path d="M 0 45 Q 30 40 45 15 M 0 90 Q 60 80 90 30 M 0 135 Q 90 120 135 45" stroke="#ffb3b5" strokeWidth="1" />
            </svg>
          </div>

          {/* Bottom-Left Spider Web Radial Corner */}
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-35 sm:opacity-50 pointer-events-none transform -translate-x-10 translate-y-10 scale-y-[-1] transition-opacity">
            <svg viewBox="0 0 240 240" fill="none" className="w-full h-full text-[#60262C]">
              <circle cx="0" cy="0" r="80" stroke="currentColor" strokeWidth="1" />
              <circle cx="0" cy="0" r="160" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="0" x2="240" y2="0" stroke="currentColor" strokeWidth="1.2" />
              <line x1="0" y1="0" x2="0" y2="240" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 0 80 Q 50 70 80 25 M 0 160 Q 100 140 160 50" stroke="#A32633" strokeWidth="1" />
            </svg>
          </div>

          {/* Bottom-Right Tactical Spider Web Control Hub */}
          <div className="absolute bottom-4 right-4 z-30 pointer-events-auto flex items-center gap-2 bg-[#1c1011]/90 backdrop-blur-md border border-[#A32633] px-3.5 py-1.5 rounded-full font-mono-tech text-[10px] text-[#ffb3b5] shadow-2xl">
            <span className="w-2.5 h-2.5 bg-[#A32633] rounded-full animate-ping" />
            <span className="font-bold tracking-wider uppercase text-white">SPIDER MESH:</span>
            <button
              onClick={() =>
                setWebDensity((prev) =>
                  prev === 'STANDARD' ? 'HIGH' : prev === 'HIGH' ? 'TACTICAL' : prev === 'TACTICAL' ? 'HYPER-WEB' : 'STANDARD'
                )
              }
              className="bg-[#20252C] hover:bg-[#291d1d] text-[#ffb3b5] px-2.5 py-0.5 rounded-xs border border-[#A32633] uppercase font-extrabold transition-colors"
            >
              {webDensity}
            </button>
            <button
              onClick={() => setShowCornerWebs(!showCornerWebs)}
              className="text-[#debfbf] hover:text-white transition-colors ml-1 font-bold"
              title="Toggle Spider Web Corner Visuals"
            >
              {showCornerWebs ? '🕸️ WEBS ON' : '🕸️ WEBS OFF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
