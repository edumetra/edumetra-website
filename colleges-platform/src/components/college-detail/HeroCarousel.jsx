import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTOPLAY_MS = 4500;

/**
 * HeroCarousel
 * Props:
 *   images  – string[]  (at least one item; first is the cover)
 *   alt     – string
 */
export default function HeroCarousel({ images = [], alt = '' }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
    const timerRef = useRef(null);

    const total = images.length;
    const isMultiple = total > 1;

    const go = useCallback((next) => {
        setDirection(next > current ? 1 : -1);
        setCurrent((next + total) % total);
    }, [current, total]);

    const startTimer = useCallback(() => {
        if (!isMultiple) return;
        timerRef.current = setInterval(() => {
            setCurrent((prev) => {
                setDirection(1);
                return (prev + 1) % total;
            });
        }, AUTOPLAY_MS);
    }, [isMultiple, total]);

    useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
    }, [startTimer]);

    const pause = () => clearInterval(timerRef.current);
    const resume = () => startTimer();

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? '8%' : '-8%', opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } },
        exit: (dir) => ({ x: dir > 0 ? '-8%' : '8%', opacity: 0, transition: { duration: 0.4 } }),
    };

    return (
        <div
            className="absolute inset-0 overflow-hidden"
            onMouseEnter={pause}
            onMouseLeave={resume}
        >
            {/* Slides */}
            <AnimatePresence custom={direction} initial={false}>
                <motion.img
                    key={current}
                    src={images[current]}
                    alt={alt}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ willChange: 'transform, opacity' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/1200x400/0f172a/3b82f6?text=Campus+View'; }}
                />
            </AnimatePresence>

            {/* Prev / Next arrows — only shown when multiple images */}
            {isMultiple && (
                <>
                    <button
                        onClick={() => go(current - 1)}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => go(current + 1)}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => go(i)}
                                aria-label={`Go to image ${i + 1}`}
                                className={`transition-all duration-300 rounded-full ${
                                    i === current
                                        ? 'w-6 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Image counter badge */}
                    <div className="absolute top-6 right-16 z-20 text-xs font-bold text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                        {current + 1} / {total}
                    </div>
                </>
            )}
        </div>
    );
}
