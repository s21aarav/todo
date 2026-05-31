"use client";

import { useEffect, useRef, useState } from 'react';

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Determine star count based on screen size (performance optimization)
    const STAR_COUNT = width < 768 ? 400 : 600;

    canvas.width = width;
    canvas.height = height;

    // --- Nebula Glows (drawn once to a separate canvas if needed, or just drawn per frame if simple) ---
    // We'll draw them per frame but they are static
    const nebulae = [
      { x: width * 0.2, y: height * 0.3, radius: width * 0.4, color: 'rgba(16, 185, 129, 0.03)' },
      { x: width * 0.8, y: height * 0.7, radius: width * 0.5, color: 'rgba(56, 189, 248, 0.02)' },
      { x: width * 0.5, y: height * 0.9, radius: width * 0.6, color: 'rgba(139, 92, 246, 0.02)' }
    ];

    // --- Stars ---
    const stars: { x: number; y: number; radius: number; vx: number; vy: number; baseAlpha: number }[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        baseAlpha: Math.random() * 0.7 + 0.1
      });
    }

    // --- Comets ---
    let comets: { x: number; y: number; vx: number; vy: number; length: number; life: number; maxLife: number }[] = [];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Nebulae
      nebulae.forEach(n => {
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        gradient.addColorStop(0, n.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      // Update & Draw Stars
      stars.forEach((star) => {
        if (!reduceMotion) {
          star.x += star.vx;
          star.y += star.vy;

          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        // Add a slight twinkle
        const alpha = reduceMotion ? star.baseAlpha : Math.max(0.1, Math.min(1, star.baseAlpha + Math.sin(Date.now() * 0.001 + star.x) * 0.2));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`; // Slightly warm white
        ctx.fill();
      });

      // Update & Draw Comets
      if (!reduceMotion) {
        if (Math.random() < 0.003) { // Reduced spawn rate
          comets.push({
            x: Math.random() * width,
            y: 0,
            vx: Math.random() * 2 + 2,
            vy: Math.random() * 2 + 2,
            length: Math.random() * 100 + 50,
            life: 0,
            maxLife: Math.random() * 100 + 100
          });
        }

        comets = comets.filter(c => c.life < c.maxLife);
        comets.forEach((comet) => {
          comet.x += comet.vx;
          comet.y += comet.vy;
          comet.life++;

          const opacity = 1 - (comet.life / comet.maxLife);

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(comet.x - comet.vx * (comet.length / 5), comet.y - comet.vy * (comet.length / 5));
          ctx.strokeStyle = `rgba(255, 255, 240, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
    };

    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (reduceMotion) {
        draw();
        cancelAnimationFrame(animationFrameId); // Draw once and stop
        return;
      }

      // Throttle FPS for performance
      const deltaTime = time - lastTime;
      if (deltaTime > interval) {
        lastTime = time - (deltaTime % interval);
        draw();
      }
    };

    animate(0);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        if (reduceMotion) draw(); // Redraw once if motion reduced
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
