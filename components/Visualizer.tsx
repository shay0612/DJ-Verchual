import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const numBars = 64;
    
    const resizeCanvas = () => {
        if(canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / numBars;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#22d3ee'); // cyan-400
      gradient.addColorStop(1, '#a855f7'); // purple-500
      ctx.fillStyle = gradient;

      for (let i = 0; i < numBars; i++) {
        const barHeight = isPlaying
          ? (Math.sin(Date.now() * 0.005 + i * 0.2) + 1) * (canvas.height / 4) + Math.random() * (canvas.height / 3)
          : 5 + Math.sin(Date.now() * 0.001 + i * 0.2) * 2;
        
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-25" />;
};

export default Visualizer;
