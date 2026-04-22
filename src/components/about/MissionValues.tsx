import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShieldCheck, Ruler, HeartHandshake } from 'lucide-react';

// Word-by-word reveal component for the mission statement
const RevealText = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'start 20%']
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className="text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight flex flex-wrap gap-x-3 gap-y-2 justify-center">
      {words.map((word, i) => {
        // Calculate the opacity range for each word
        const start = i / words.length;
        const end = start + (1 / words.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
        
        return (
          <motion.span key={i} style={{ opacity }} className="text-jrs-black relative">
            {word}
          </motion.span>
        );
      })}
    </p>
  );
};

const VALUES = [
  {
    title: 'Integridade',
    description: 'A ética no centro de tudo. Trabalhamos com transparência e honestidade em todas as relações, do colaborador ao cliente final.',
    icon: ShieldCheck,
    color: 'from-blue-500/20 to-blue-600/5'
  },
  {
    title: 'Rigor',
    description: 'A precisão forjada a ferro. Exigimos o máximo padão de qualidade dos nossos processos, assegurando soluções de excelência.',
    icon: Ruler,
    color: 'from-jrs-green-start/20 to-jrs-green-end/5'
  },
  {
    title: 'Respeito',
    description: 'Valorização contínua de pessoas e meio ambiente. Promovemos um ecosistema saudável e sustentável para as futuras gerações.',
    icon: HeartHandshake,
    color: 'from-purple-500/20 to-purple-600/5'
  }
];

export function MissionValues() {
  return (
    <section className="bg-jrs-cream py-32 px-4 md:px-12 relative overflow-hidden">
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Mission Statement (Text Reveal on Scroll) */}
        <div className="text-center max-w-5xl mx-auto mb-32">
          <span className="text-sm tracking-widest uppercase font-semibold text-jrs-green-start mb-8 block">A Nossa Missão</span>
          <RevealText text="Servir cada cliente com a mais vasta gama de soluções siderúrgicas do mercado." />
          <p className="mt-8 text-xl text-slate-500 font-light max-w-3xl mx-auto">
            Olhamos para o futuro com a ambição de continuar a ser uma referência no setor na região Norte e Centro, expandindo a nossa oferta para que, independentemente do desafio, a resposta seja encontrada na JRS Ferros.
          </p>
        </div>

        {/* Values 3D Cards */}
        <div className="text-center mb-12">
          <span className="text-sm tracking-widest uppercase font-semibold text-jrs-green-start mb-3 block">Os Nossos Valores</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-jrs-black">Há princípios que não têm preço</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ 
                scale: 1.02, 
                rotateY: 2, 
                rotateX: 2,
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)"
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${value.color} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 text-slate-800 group-hover:text-jrs-green-start transition-colors duration-300">
                  <value.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-3xl font-display font-bold text-jrs-black mb-4 group-hover:translate-x-1 transition-transform duration-300">
                  {value.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed font-light">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
