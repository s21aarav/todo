"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const stars: Star[] = [];
    const numStars = 800;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.2,
        speed: Math.random() * 0.3 + 0.05, // Sped up the stars!
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const comets: Comet[] = [];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw stars
      for (const star of stars) {
        star.y -= star.speed;

        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.2) star.opacity = 0.2;
        if (star.opacity > 1) star.opacity = 1;

        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      }

      // Randomly spawn comets (0.5% chance per frame)
      if (Math.random() < 0.005) {
        const spawnRight = Math.random() > 0.5;
        const spawnX = spawnRight ? width + 50 : Math.random() * width;
        const spawnY = spawnRight ? Math.random() * height * 0.5 : -50;
        
        comets.push({
          x: spawnX,
          y: spawnY,
          vx: -(Math.random() * 5 + 5), // Fast to the left
          vy: Math.random() * 3 + 3,    // Fast downwards
          length: Math.random() * 100 + 80,
          opacity: 1,
        });
      }

      // Draw comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.opacity -= 0.003; // Fade out slowly

        if (comet.opacity <= 0 || comet.x < -comet.length || comet.y > height + comet.length) {
          comets.splice(i, 1);
          continue;
        }

        const speed = Math.sqrt(comet.vx * comet.vx + comet.vy * comet.vy);
        const tailX = comet.x - (comet.vx / speed) * comet.length;
        const tailY = comet.y - (comet.vy / speed) * comet.length;

        const gradient = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(255, 255, 255, ${comet.opacity})`;
        
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset for next drawing operations
      }
    };

    const animate = () => {
      draw();
      frame = requestAnimationFrame(animate);
    };

    if (reduceMotion) {
      draw();
    } else {
      animate();
    }

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
