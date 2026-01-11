import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface Star {
  id: string;
  x: number;
  y: number;
  z: number;
  name: string;
  isPublic: boolean;
  category: string;
  size: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
  connections: number[];
}

export const GalaxyMap: React.FC<{ onSelectStar?: (id: string) => void }> = ({ onSelectStar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const starsRef = useRef<Star[]>([]);
  const backgroundStarsRef = useRef<{x: number, y: number, size: number, opacity: number}[]>([]);
  const rotationRef = useRef({ x: 0.05, y: 0.05 });
  const mousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const updateSize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    updateSize();

    const starCount = 800;
    const colors = ['#FFD1DC', '#FDE68A', '#E9D5FF', '#93C5FD', '#FFFFFF'];

    starsRef.current = Array.from({ length: starCount }).map((_, i) => ({
      id: `soul-${i}`,
      x: (Math.random() - 0.5) * 6000,
      y: (Math.random() - 0.5) * 6000,
      z: (Math.random() - 0.5) * 6000,
      name: i % 15 === 0 ? `Legacy of Star ${i}` : `Memory ${i}`,
      isPublic: Math.random() > 0.4,
      category: 'eternal',
      size: Math.random() * 2.5 + 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.01 + Math.random() * 0.02,
      connections: Math.random() > 0.98 ? [Math.floor(Math.random() * starCount)] : []
    }));

    backgroundStarsRef.current = Array.from({ length: 2000 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1,
      opacity: Math.random() * 0.5
    }));

    const drawRhombus = (x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.8);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size * 1.8);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    };

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      backgroundStarsRef.current.forEach(s => {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = s.opacity * (0.5 + Math.sin(time + s.x) * 0.5);
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      ctx.globalCompositeOperation = 'screen';
      const roseGrad = ctx.createRadialGradient(width * 0.3, height * 0.4, 0, width * 0.3, height * 0.4, width * 0.6);
      roseGrad.addColorStop(0, 'rgba(219, 39, 119, 0.08)');
      roseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = roseGrad;
      ctx.fillRect(0, 0, width, height);

      const indigoGrad = ctx.createRadialGradient(width * 0.7, height * 0.6, 0, width * 0.7, height * 0.6, width * 0.7);
      indigoGrad.addColorStop(0, 'rgba(79, 70, 229, 0.06)');
      indigoGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = indigoGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      const cx = width / 2;
      const cy = height / 2;
      const fov = 1500;

      if (!isDragging.current) {
        rotationRef.current.y += 0.0004;
        rotationRef.current.x *= 0.98;
      }

      const projected = starsRef.current.map((star) => {
        let { x, y, z } = star;
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const tx = x * cosY - z * sinY;
        const tz = x * sinY + z * cosY;
        x = tx; z = tz;
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const ty = y * cosX - z * sinX;
        const tzz = y * sinX + z * cosX;
        y = ty; z = tzz;
        const scale = fov / (fov + z);
        const px = x * scale + cx;
        const py = y * scale + cy;
        return { ...star, px, py, scale, z };
      });

      projected.sort((a, b) => b.z - a.z).forEach(p => {
        if (p.z > -fov && p.px > -100 && p.px < width + 100 && p.py > -100 && p.py < height + 100) {
          const baseSize = p.size * p.scale;
          const twinkle = (Math.sin(time * 5 + p.twinklePhase) + 1) / 2;
          const pulse = (Math.sin(time * 2 + p.twinklePhase) + 1) / 2;
          const alpha = p.isPublic ? (0.2 + 0.7 * p.scale) : (0.05 * p.scale);

          const dx = p.px - mousePos.current.x;
          const dy = p.py - mousePos.current.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const isHovered = dist < baseSize * 10;

          const glowSize = baseSize * (5 + pulse * 3);
          const grad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, glowSize);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.3, p.color + '33');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha * 0.4 * twinkle;
          ctx.beginPath();
          ctx.arc(p.px, p.py, glowSize, 0, Math.PI * 2);
          ctx.fill();

          drawRhombus(p.px, p.py, baseSize, p.color, alpha * (0.8 + 0.2 * twinkle));

          if (isHovered) {
            if (p.isPublic) {
              ctx.fillStyle = 'white';
              ctx.font = '300 12px serif';
              ctx.textAlign = 'center';
              ctx.globalAlpha = 1;
              ctx.fillText(p.name, p.px, p.py - baseSize * 5);
              ctx.font = '700 8px sans-serif';
              ctx.fillText('CLICK TO ENTER', p.px, p.py + baseSize * 6);
            } else {
              ctx.fillStyle = 'rgba(255,255,255,0.4)';
              ctx.font = '700 8px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('PRIVATE SANCTUARY', p.px, p.py + baseSize * 6);
            }
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mousePos.current = { x: mx, y: my };
      if (isDragging.current) {
        rotationRef.current.y += e.movementX * 0.0015;
        rotationRef.current.x += e.movementY * 0.0015;
      }
    };

    const handleClick = () => {
      const fov = 1500;
      const cx = width / 2;
      const cy = height / 2;

      const clickedStar = starsRef.current.find(star => {
        let { x, y, z } = star;
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const tx = x * cosY - z * sinY;
        const tz = x * sinY + z * cosY;
        x = tx; z = tz;
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const ty = y * cosX - z * sinX;
        const tzz = y * sinX + z * cosX;
        y = ty; z = tzz;
        const scale = fov / (fov + z);
        const px = x * scale + cx;
        const py = y * scale + cy;

        const dx = px - mousePos.current.x;
        const dy = py - mousePos.current.y;
        return Math.sqrt(dx*dx + dy*dy) < (star.size * scale * 10);
      });

      if (clickedStar && clickedStar.isPublic) {
        navigate(`/memorial/cosmic-space`);
      }
    };

    const handleMouseDown = () => { isDragging.current = true; };
    const handleMouseUp = () => { isDragging.current = false; };

    window.addEventListener('resize', updateSize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [navigate]);

  return (
    <div className="relative w-full h-[80vh] rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#010410] shadow-[0_0_80px_rgba(0,0,0,0.5)] cursor-move group">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.6)_100%)]"></div>
        <div className="absolute top-10 left-10">
           <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] max-w-[280px] animate-fade-in shadow-2xl">
              <div className="flex items-center gap-3 text-rose-300 mb-4">
                 <Heart className="w-5 h-5 fill-rose-300" />
                 <h2 className="font-serif text-2xl tracking-tight">Eternal Echo</h2>
              </div>
              <p className="text-slate-300 text-xs font-light leading-relaxed tracking-wide italic">
                "Every star marked with a glow represents a life open to celebration. Click to explore their eternal legacy."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
