
import React, { useRef, useEffect } from 'react';

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const stars: { x: number; y: number; z: number }[] = [];
    const numStars = 500;

    const init = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      stars.length = 0;
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width,
          y: (Math.random() - 0.5) * canvas.height,
          z: Math.random() * canvas.width,
        });
      }
    };

    const draw = () => {
      if (!canvas || !ctx || canvas.width === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      stars.forEach(star => {
        star.z -= 1; // Move star closer

        // If star is behind the screen, reset it to the back
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width;
          star.y = (Math.random() - 0.5) * canvas.height;
          star.z = canvas.width;
        }

        // This check is now safe because star.z was reset if it was <= 0
        const k = 128.0 / star.z;
        const px = star.x * k;
        const py = star.y * k;
        
        const radius = (1 - star.z / canvas.width) * 2;
        
        // Only draw if the star is visible
        if (radius > 0) {
            const opacity = 1 - star.z / canvas.width;
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      init();
    };

    init();
    draw();
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};

export default Starfield;
