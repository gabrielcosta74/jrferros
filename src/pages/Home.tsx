import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Package, Phone, TrendingUp, Building2, Hammer, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { AboutCompany } from '@/src/components/about/AboutCompany';
import { CATALOG, COMPANY_INFO } from '@/src/constants';
import { HeroSlider } from '@/src/components/ui/hero-slider';
import { ImageGallery } from '@/src/components/ui/image-gallery';
import { ExternalMediaGate } from '@/src/components/legal/CookieConsent';

// Animation variants for more premium feel
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export function Home() {

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Parallax Effect could be added here, for now static high-res image */}
        <HeroSlider />

        {/* Content */}
        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center"
          >
            {/* Badge removed as requested */}

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-[1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-jrs-green-start to-jrs-green-end">
                JRS Ferros
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              O seu parceiro de confiança no comércio de ferro.
              Stock permanente e entrega rápida na zona do Grande Porto e Aveiro.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4 justify-center w-full">
              <Button size="lg" asChild className="text-base h-14 px-8 bg-jrs-green-start hover:bg-jrs-green-end border-0 shadow-[0_0_20px_rgba(46,139,87,0.3)] hover:shadow-[0_0_30px_rgba(46,139,87,0.5)] transition-all duration-300 rounded-full">
                <Link to="/contactos">Pedir Orçamento <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-14 px-8 border-white/20 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm rounded-full transition-all duration-300">
                <Link to="/produtos">Explorar Catálogo</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.5 }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 text-white/50 md:flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-jrs-black text-white py-12 border-b border-white/10">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: "Anos de Experiência", value: "+50", icon: TrendingUp },
              { label: "Artigos em Stock", value: "+750", icon: Package },
              { label: "Clientes Satisfeitos", value: "+7000", icon: ShieldCheck },
              { label: "Rápidas e Flexíveis", value: "Entregas", icon: Truck },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="flex flex-col items-center text-center space-y-2 group"
              >
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-jrs-green-start/20 transition-colors duration-300 mb-2">
                  <stat.icon className="h-6 w-6 text-jrs-green-start opacity-90 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="pb-1 text-3xl md:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{stat.value}</span>
                <span className="text-sm text-slate-400 uppercase tracking-widest font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <AboutCompany />



      {/* Products Section */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-jrs-black">Os Nossos Produtos</h2>
              <p className="text-slate-600 max-w-xl">
                Conheça toda a nossa gama de materiais.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex group border-slate-300 hover:border-jrs-green-start hover:text-jrs-green-start">
              <Link to="/contactos">
                Pedir Orçamento
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {CATALOG.map((category) => {
              return (
              <motion.div key={category.id} variants={fadeUp}>
                <Card className="overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col bg-white rounded-2xl relative cursor-pointer">
                  <Link
                    to={`/produtos?categoria=${category.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Ver ${category.name}`}
                  />
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col relative">
                    <div className="absolute -top-5 right-6 h-10 w-10 bg-jrs-green-start text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-jrs-green-start transition-colors duration-300 pr-6">{category.name}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )})}
          </motion.div>

          <div className="mt-12 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link to="/contactos">Pedir Orçamento</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Instalações e Galeria */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-jrs-black mb-4">A Nossa Infraestrutura</h2>
            <p className="text-slate-600 text-lg">Conheça as nossas instalações em detalhe, o stock permanente que assegura prazos de entrega curtos, e a nossa maquinaria de precisão.</p>
          </div>
          <ImageGallery />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-jrs-black mb-4">Setores de Atuação</h2>
            <p className="text-slate-600 text-lg">Soluções específicas para cada tipo de necessidade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Construção Civil", icon: Building2, img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop", desc: "Varão, Malhas, Estribos" },
              { title: "Serralharia", icon: Hammer, img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop", desc: "Tubos, Cantoneiras, Barras" },
              { title: "Indústria", icon: Package, img: "/images/industria_metal.png", desc: "Chapas, Vigas, Perfis" },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="h-14 w-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-jrs-green-start group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl border border-white/10">
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-white mb-3 group-hover:text-jrs-green-start transition-colors duration-300">{cat.title}</h3>
                  <p className="text-slate-300 text-base mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">{cat.desc}</p>
                  <div className="inline-flex items-center text-white text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <span className="border-b border-jrs-green-start pb-1">Ver Produtos</span> <ArrowRight className="ml-2 h-4 w-4 text-jrs-green-start group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </div>
                <Link to="/produtos" className="absolute inset-0 z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Encontre-nos Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-jrs-green-start uppercase tracking-widest">Encontre-nos</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold text-jrs-black">
                Visite as nossas instalações
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                O nosso armazém está estrategicamente localizado na Nacional nº1, em Lourosa, com fácil acesso para carga pesada, à entrada da Auto-estrada, garantindo resposta rápida e conveniente para toda a região.
              </p>
              
              <div className="flex items-start gap-4 pt-4">
                <div className="h-12 w-12 rounded-xl bg-jrs-green-start/10 flex items-center justify-center text-jrs-green-start shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-jrs-black text-xl mb-1">A Nossa Morada</h4>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {COMPANY_INFO.addressDisplay}
                  </p>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-video lg:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100"
            >
              <ExternalMediaGate serviceName="Google Maps">
                <iframe
                  title="Mapa de Localização JRS Ferros"
                  src="https://maps.google.com/maps?q=Av.+Principal+183,+4535-014+Lourosa,+Portugal&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-filter duration-700 ease-in-out"
                />
              </ExternalMediaGate>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-jrs-black relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-jrs-green-start/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              Pronto para começar a sua obra?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Não perca tempo com fornecedores incertos. Na JRS Ferros garantimos qualidade, preço competitivo e rapidez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg h-16 px-10 bg-gradient-to-r from-jrs-green-start to-jrs-green-end hover:opacity-90 shadow-lg shadow-jrs-green-start/20">
                <Link to="/contactos">Pedir Orçamento Gratuito</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-16 px-10 border-white/20 text-white hover:bg-white/10">
                <a href="tel:+351227643124" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Ligar Agora
                </a>
              </Button>
            </div>
            <p className="text-sm text-slate-500 pt-4">
              Resposta em menos de 1 dia útil para pedidos via email.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
