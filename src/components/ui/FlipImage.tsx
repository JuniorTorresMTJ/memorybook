import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipImageProps {
    images: string[];
    descriptions?: string[];
    interval?: number;
}

export const FlipImage: React.FC<FlipImageProps> = ({ images, descriptions = [], interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    const variants = {
        enter: () => ({
            rotateY: -90,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            rotateY: 0,
            opacity: 1,
        },
        exit: () => ({
            zIndex: 0,
            rotateY: 90,
            opacity: 0,
        }),
    };

    return (
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] perspective-1000">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    custom={1}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        duration: 0.8
                    }}
                    className="absolute inset-0 w-full h-full object-cover origin-left"
                    style={{
                        backfaceVisibility: 'hidden',
                        transformStyle: 'preserve-3d'
                    }}
                    alt={descriptions[currentIndex] || "Memory Book illustration"}
                />
            </AnimatePresence>
        </div>
    );
};
