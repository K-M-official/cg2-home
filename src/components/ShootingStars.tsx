import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

export const ShootingStars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let stars: Star[] = [];

    const createStar = () => {
      const x = Math.random() * width + 200;
      const y = Math.random() * height * 0.5;
      const length = Math.random() * 80 + 20;
      const speed = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.5 + 0.2;
      // Angle usually around -45 degrees for top-right to bottom-left
      const angle = Math.PI / 4 + 0.2; 
      
      stars.push({ x, y, length, speed, opacity, angle });
    };

    // Initial stars
    for(let i=0; i<3; i++) createStar();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Randomly add new stars sparingly
      if (Math.random() < 0.01) createStar();

      stars.forEach((star, index) => {
        star.x -= star.speed * Math.cos(star.angle) * 4;
        star.y += star.speed * Math.sin(star.angle) * 4;
        star.opacity -= 0.005;

        if (star.opacity <= 0) {
          stars.splice(index, 1);
        } else {
          ctx.beginPath();
          const tailX = star.x + star.length * Math.cos(star.angle);
          const tailY = star.y - star.length * Math.sin(star.angle);
          
          const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
