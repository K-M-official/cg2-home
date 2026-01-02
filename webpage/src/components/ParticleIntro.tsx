import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  z: number;
  tx: number; // Target X
  ty: number; // Target Y
  tz: number; // Target Z
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  phase: number; // For twinkling
}

interface ParticleIntroProps {
  onEnter: () => void;
}

export const ParticleIntro: React.FC<ParticleIntroProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fading, setFading] = useState(false);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleEnter = () => {
    setFading(true);
    setTimeout(onEnter, 1000); // Wait for CSS fade out
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const particleCount = 1200; // Increased density
    const starPoints = 5;
    const outerRadius = Math.min(width, height) * 0.22;
    const innerRadius = outerRadius * 0.4;
    const depth = 150;

    // Helper to get point on a 3D star
    const getStarPoint = (i: number, total: number) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2; // Rotate to point up
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const z = (Math.random() - 0.5) * depth; 
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        z: z
      };
    };

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
      // Create the star shape structure
      const segment = Math.floor(Math.random() * (starPoints * 2));
      const t = Math.random();
      
      const p1 = getStarPoint(segment, starPoints * 2);
      const p2 = getStarPoint((segment + 1) % (starPoints * 2), starPoints * 2);

      // Interpolate along the edge
      const tx = p1.x + (p2.x - p1.x) * t;
      const ty = p1.y + (p2.y - p1.y) * t;
      const tz = p1.z + (p2.z - p1.z) * t;

      // Add some random spread around the lines to give volume
      const spread = 15;
      
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5, // Start scattered wide
        y: (Math.random() - 0.5) * height * 1.5,
        z: (Math.random() - 0.5) * 1000,
        tx: tx + (Math.random() - 0.5) * spread,
        ty: ty + (Math.random() - 0.5) * spread,
        tz: tz + (Math.random() - 0.5) * spread,
        vx: 0, vy: 0, vz: 0,
        size: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.6 ? '#FDE68A' : '#A5B4FC', // Gold or Lavender
        phase: Math.random() * Math.PI * 2
      });
    }

    let rotation = 0;
    let time = 0;

    const animate = () => {
      if (!ctx) return;
      time += 0.01;
      
      // Clear with trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; // Dark background with trail
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      // Mouse parallax
      const targetRotationX = (mouseRef.current.y / height - 0.5) * 0.5;
      const targetRotationY = (mouseRef.current.x / width - 0.5) * 0.5;

      rotation += 0.003; // Auto rotation

      particles.forEach(p => {
        // Physics: Ease towards target
        const ease = 0.04;
        
        // Apply rotation to target positions
        const cos = Math.cos(rotation + targetRotationY);
        const sin = Math.sin(rotation + targetRotationY);
        const cosX = Math.cos(targetRotationX);
        const sinX = Math.sin(targetRotationX);
        
        // Rotate Y
        let rtx = p.tx * cos - p.tz * sin;
        let rtz = p.tx * sin + p.tz * cos;
        let rty = p.ty;

        // Rotate X (tilt)
        const tempY = rty * cosX - rtz * sinX;
        const tempZ = rty * sinX + rtz * cosX;
        rty = tempY;
        rtz = tempZ;

        // Move particle
        p.x += (rtx - p.x) * ease;
        p.y += (rty - p.y) * ease;
        p.z += (rtz - p.z) * ease;

        // Perspective projection
        const fov = 800;
        const scale = fov / (fov + p.z);
        const x2d = p.x * scale + cx;
        const y2d = p.y * scale + cy;

        // Twinkle logic
        const opacity = (Math.sin(time * 2 + p.phase) + 1) / 2 * 0.5 + 0.5;

        // Draw
        ctx.beginPath();
        ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, (scale - 0.2)) * opacity; 
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-1000 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <canvas ref={canvasRef} className="block w-full h-full bg-slate-900" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <button 
          onClick={handleEnter}
          className="group relative mb-6 transition-transform hover:scale-105 outline-none"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <h1 className="text-6xl lg:text-9xl font-serif text-white font-bold tracking-widest relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-pointer">
            K&M ERA
          </h1>
        </button>
        
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-indigo-400 to-transparent mb-8"></div>
        
        <p className="text-slate-300 font-light text-xl lg:text-2xl tracking-[0.2em] uppercase animate-pulse-slow mb-12">
          The era of keeping memories
        </p>

        <button 
             onClick={handleEnter}
             className="px-8 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/50 transition-all text-sm uppercase tracking-widest flex items-center gap-2 group"
        >
             <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Enter Experience
        </button>
      </div>
    </div>
  );
};

