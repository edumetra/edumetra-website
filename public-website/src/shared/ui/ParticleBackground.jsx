import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({
    particleCount = 50,
    colors = ['#3b82f6', '#60a5fa', '#14b8a6', '#2dd4bf'],
    className = ''
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Set canvas size
        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
            }

            reset() {
                this.x = Math.random() * width;
                this.y = -10;
                this.size = Math.random() * 3 + 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.2;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = Math.random() * 0.5 + 0.2;
            }

            update() {
                // Move particle
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    const angle = Math.atan2(dy, dx);
                    this.vx -= Math.cos(angle) * 0.05;
                    this.vy -= Math.sin(angle) * 0.05;
                }

                // Damping
                this.vx *= 0.99;
                this.vy *= 0.99;

                // Reset if out of bounds
                if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
                    this.reset();
                }

                // Pulse opacity
                this.opacity += (Math.random() - 0.5) * 0.01;
                this.opacity = Math.max(0.2, Math.min(0.7, this.opacity));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();

                // Glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Initialize particles
        particlesRef.current = Array.from({ length: particleCount }, () => new Particle());

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particlesRef.current.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particlesRef.current.forEach((particle, i) => {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const other = particlesRef.current[j];
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - dist / 120) * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [particleCount, colors]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
};

export default ParticleBackground;
