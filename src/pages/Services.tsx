import { Link } from 'react-router-dom';
import { ArrowRight, Gauge, Scissors, ShieldCheck, Clock3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { SERVICES } from '@/src/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const serviceIcons = {
  'corte-jato-agua': Scissors,
  'bascula-pesagem': Gauge,
} as const;

export function Services() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="/images/pesagem-servicos.jpeg"
            alt="Serviços JRS Ferros"
            className="h-full w-full object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />

        <div className="container relative px-4 py-20 md:px-6 md:py-28">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="max-w-3xl">
            <span className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-jrs-green-start">
              Serviços
            </span>
            <h1 className="mb-5 text-4xl font-display font-bold leading-tight text-white md:text-6xl">
              Corte e pesagem com resposta prática para obra e indústria
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              A JRS Ferros presta serviços de apoio técnico que complementam o fornecimento de materiais, com foco em rapidez, precisão e resposta ajustada ao trabalho.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-display font-bold text-slate-900 md:text-4xl">Serviços disponíveis</h2>
              <p className="mt-3 text-slate-500">
                Esta secção é independente do catálogo de produtos e foi pensada para apresentar serviços prestados pela empresa.
              </p>
            </div>
            <Button asChild className="h-11 rounded-full px-6">
              <Link to="/contactos">Pedir Informação</Link>
            </Button>
          </div>

          <div className="space-y-6">
            {SERVICES.map((service, index) => {
              const Icon = serviceIcons[service.id as keyof typeof serviceIcons] ?? ShieldCheck;

              return (
                <motion.article
                  key={service.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.08 }}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative min-h-[280px] bg-slate-100">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6 md:p-8">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-3xl font-display font-bold text-white">{service.name}</h3>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-6 md:p-8">
                      <div>
                        <div className="mb-6 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Condições</p>
                            <p className="text-sm font-semibold text-slate-800">{service.priceNote}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Destaque</p>
                            <p className="text-sm font-semibold text-slate-800">{service.highlight}</p>
                          </div>
                        </div>

                        <p className="text-base leading-relaxed text-slate-600">{service.description}</p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                            <ShieldCheck className="h-4 w-4 text-jrs-green-start" />
                            Apoio técnico
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                            <Clock3 className="h-4 w-4 text-jrs-green-start" />
                            Resposta mediante contacto
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="h-11 rounded-full px-6">
                          <Link to={`/contactos?produto=${encodeURIComponent(service.name)}`}>
                            Pedir Orçamento
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-full px-6 border-slate-300">
                          <Link to="/contactos">
                            Falar Connosco <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
