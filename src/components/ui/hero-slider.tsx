import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const IMAGES = [
    '/imagensferros/ferroswide.jpeg',
    '/imagensferros/workplaceniceshot.jpeg',
    '/imagensferros/companyfromoutsideview.jpeg',
    '/imagensferros/machinery.jpeg'
];

export function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
        }, 6000); // Change image every 6 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-jrs-black">
            <AnimatePresence initial={false}>
                <motion.img
                    key={currentIndex}
                    src={IMAGES[currentIndex]}
                    alt="JRS Ferros"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.5, ease: 'easeInOut' },
                        scale: { duration: 8, ease: 'linear' },
                    }}
                />
            </AnimatePresence>
            {/* Medium gradient for visibility while keeping text highly readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-900/20" />
            <div className="absolute inset-0 bg-jrs-black/20" />
        </div>
    );
}
