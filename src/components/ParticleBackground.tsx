import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 50;
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particles';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      particle.style.animationDuration = `${3 + Math.random() * 2}s`;
      container.appendChild(particle);
      particles.push(particle);
    }

    // Add some special floating elements
    const specialElements = [
      { class: 'w-1 h-1 bg-neon-purple', count: 20 },
      { class: 'w-1.5 h-1.5 bg-neon-pink', count: 15 },
      { class: 'w-2 h-2 bg-neon-green', count: 10 }
    ];

    specialElements.forEach(({ class: className, count }) => {
      for (let i = 0; i < count; i++) {
        const element = document.createElement('div');
        element.className = `absolute ${className} rounded-full opacity-40 animate-float`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * 2}s`;
        element.style.animationDuration = `${4 + Math.random() * 4}s`;
        container.appendChild(element);
      }
    });

    // Cleanup
    return () => {
      particles.forEach(particle => particle.remove());
      const specialElements = container.querySelectorAll('.floating-particles + div');
      specialElements.forEach(el => el.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
      }}
    />
  );
};

export default ParticleBackground;
