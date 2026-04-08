import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';

export function AboutCompany() {
  return (
    <section className="py-24 bg-jrs-cream">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-jrs-green-start/10 rounded-tl-3xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-jrs-black/5 rounded-br-3xl -z-10" />
            <img
              src="/imagensferros/transportemelhorfoto.jpeg"
              alt="JRS Ferros Entregas e Frota"
              className="rounded-lg shadow-2xl w-full object-cover aspect-[4/3]"
            />
            <div className="absolute bottom-8 left-8 bg-white p-6 rounded-lg shadow-xl max-w-xs hidden md:block">
              <p className="font-display font-bold text-xl text-jrs-black mb-1">Qualidade com Tradição</p>
              <p className="text-sm text-slate-500">É o nosso compromisso em cada entrega.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-sm font-bold text-jrs-green-start uppercase tracking-widest mb-2">JRS Ferros</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-jrs-black mb-6">
                Mais do que um fornecedor, um parceiro para a sua obra.
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Na JRS Ferros, décadas de experiência no setor metalúrgico traduzem-se numa oferta vasta e entregas rápidas e flexíveis. Mais do que fornecedores, somos parceiros da construção civil e da serralharia, com um atendimento humano focado nas necessidades reais de cada obra.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: "Certificação de Qualidade", desc: "Todos os materiais cumprem as normas europeias." },
                { title: "Vasta Oferta de Artigos", desc: "Soluções à medida para todo o tipo de ocasiões." },
                { title: "Entregas Rápidas e Flexíveis", desc: "Frota própria para garantir que a sua obra não para." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-jrs-green-start/20 flex items-center justify-center text-jrs-green-start shrink-0 mt-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-jrs-black">{item.title}</h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="border-jrs-black text-jrs-black hover:bg-jrs-black hover:text-white transition-colors" asChild>
              <Link to="/contactos">Falar com um Especialista</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
