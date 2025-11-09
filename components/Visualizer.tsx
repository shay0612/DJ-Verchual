import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  audioContext: AudioContext;
  sourceNode: MediaElementAudioSourceNode;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, audioContext, sourceNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioContext || !sourceNode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let animationFrameId: number;
    
    const resizeCanvas = () => {
        if(canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#22d3ee'); // cyan-400
      gradient.addColorStop(1, '#a855f7'); // purple-500
      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * (canvas.height / 255);
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      // It is important to not disconnect the sourceNode itself, as it's shared.
      // We assume the analyser will be garbage collected.
      try {
        sourceNode.disconnect(analyser);
      } catch (e) {
        // This can throw an error if the node is already disconnected, which is fine.
      }
    };
  }, [isPlaying, audioContext, sourceNode]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-25" />;
};

export default Visualizer;