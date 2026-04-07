import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, Factory, Store } from 'lucide-react';

const historyTimeline = [
  {
    year: '1969',
    title: 'O Início',
    subtitle: 'De um Sonho Familiar à Fundação',
    description: 'A história da JRS Ferros começou a escrever-se em 1969, pelas mãos de Joaquim Ribeiro de Sousa e Maria Emília Ferreira de Sousa. Com uma visão empreendedora e uma forte ética de trabalho, o casal iniciou a sua atividade no setor da sucata e do ferro-velho, operando a partir de um modesto estaleiro na sua própria residência. O que começou como um pequeno negócio familiar rapidamente revelou um potencial de crescimento que moldaria o futuro da região.',
    icon: Calendar,
    color: 'from-amber-400 to-orange-600',
    alignRight: false
  },
  {
    year: '1975-1979',
    title: 'A Transição',
    subtitle: 'Siderurgia e a Expansão',
    description: 'O ano de 1975 marcou um ponto de viragem decisivo com a entrada no mercado da siderurgia nacional e no comércio de produtos siderúrgicos. Com esta expansão, surgiram as primeiras instalações dedicadas: um pequeno armazém que simbolizava o crescimento da empresa. O sucesso rapidamente tornou este espaço insuficiente. Em 1979, a empresa deu o passo definitivo para as suas atuais instalações situadas na Estrada Nacional nº1 em Lourosa.',
    icon: Factory,
    color: 'from-slate-400 to-slate-600',
    alignRight: true
  },
  {
    year: 'Hoje',
    title: 'O Armazém',
    subtitle: 'Onde "Tem de Tudo"',
    description: 'Ao longo das décadas, a JRS Ferros consolidou uma reputação de um armazém que “tem de tudo”. Este reconhecimento não foi obra do acaso, mas sim o resultado de um compromisso contínuo em diversificar a gama de produtos. Em 2019, celebrámos com orgulho os nossos 50 anos de história, um marco que atesta a nossa resiliência e a confiança depositada por gerações de clientes.',
    icon: Store,
    color: 'from-jrs-green-start to-jrs-green-end',
    alignRight: false
  }
];

export function HistoryTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth progress bar mapping the entire section scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="relative bg-jrs-black py-32 md:py-48 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-jrs-green-start/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-32 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            A Nossa Origem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-400 font-light max-w-2xl mx-auto"
          >
            Uma jornada de resiliência e crescimento que começou num modesto estaleiro.
          </motion.p>
        </div>

        <div className="relative">
          {/* Main Central Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 md:-translate-x-1/2" />
          
          {/* Animated Scroll Progress Line */}
          <motion.div 
            style={{ height: progressHeight }}
            className="absolute left-6 md:left-1/2 top-0 w-px bg-gradient-to-b from-jrs-green-start to-jrs-green-end md:-translate-x-1/2 origin-top rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          />

          <div className="flex flex-col gap-24 md:gap-40">
            {historyTimeline.map((item, index) => (
              <TimelineEvent key={index} item={item} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// Separate component for each event to handle its own scroll-triggered reveal
function TimelineEvent({ item }: { item: typeof historyTimeline[0] }) {
  const isRight = item.alignRight;

  return (
    <div className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isRight ? 'md:flex-row-reverse' : ''}`}>
      
      {/* Timeline Node (Dot) */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-200px" }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="absolute left-6 md:left-1/2 w-4 h-4 bg-jrs-black border-2 border-jrs-green-start rounded-full md:-translate-x-1/2 z-20 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
      />

      {/* Empty space for the opposite side on Desktop */}
      <div className="hidden md:block md:w-1/2" />

      {/* Content Side */}
      <div className="w-full pl-16 md:pl-0 md:w-1/2 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 50, x: isRight ? -20 : 20 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-full max-w-xl flex flex-col ${isRight ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}
        >
          {/* Year Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-xl`}>
            <item.icon className={`h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r ${item.color}`} style={{ color: "currentColor" }} />
            <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${item.color}`}>
              {item.year}
            </span>
          </div>

          <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
            {item.title}
          </h3>
          <h4 className="text-xl md:text-2xl font-light text-slate-300 mb-6">
            {item.subtitle}
          </h4>
          
          <div className="relative p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 shadow-2xl">
            {/* Subtle inner glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-[40px] opacity-10`} />
            <p className="relative z-10 text-slate-400 text-lg leading-relaxed font-light">
              {item.description}
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
