import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export function HeroAbout() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Optimize performance: Scale only a simple, hardware-accelerated layer
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  
  // Subtle parallax move for the text instead of huge ranges
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={containerRef} className="relative h-[150vh] bg-jrs-black text-white">
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-jrs-black">
        
        {/* Animated Background Layer - Minimal complexity for 60FPS */}
        <motion.div
          style={{ scale: backgroundScale }}
          className="absolute inset-0 w-full h-full bg-slate-900 origin-center will-change-transform"
        >
          {/* Base Background Texture (Optimized) */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/40 to-jrs-black" />
          
          {/* Simple Radial Glow instead of massive blurs + mix-blend */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-jrs-green-start/10 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-jrs-green-end/10 via-transparent to-transparent opacity-80" />
        </motion.div>

        {/* Content Layer (Parallax Translation) */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 will-change-[transform,opacity]"
        >
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-jrs-green-start font-medium tracking-widest uppercase mb-6 text-sm md:text-base"
          >
            A Nossa História
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-none mb-8 drop-shadow-lg"
          >
            Mais de <span className="text-transparent bg-clip-text bg-gradient-to-r from-jrs-green-start to-white">50 anos</span><br />
            de Qualidade com Tradição
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-slate-400 max-w-2xl text-lg md:text-xl font-light"
          >
            A excelência forjada no tempo, um compromisso de ferro.
          </motion.p>
        </motion.div>

        {/* Scroll Indicator - Unaffected by scroll progression for stable UI */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Scroll</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-8 bg-gradient-to-b from-jrs-green-start to-transparent rounded-full opacity-60"
          />
        </motion.div>

      </div>
    </section>
  );
}
