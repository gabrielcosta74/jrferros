import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, Building2, ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { COMPANY_INFO } from '@/src/constants';

export function Contact() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(() => {
    const produto = searchParams.get('produto') ?? '';
    const medida = searchParams.get('medida') ?? '';
    const message = produto
      ? `Olá, gostaria de obter um orçamento para: ${produto}${medida ? ` (${medida})` : ''}.`
      : '';
    return { name: '', email: '', phone: '', message: message };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-jrs-cream flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img
          src="/imagensferros/companyfromoutsideview.jpeg"
          alt="JRS Ferros Instalações Exteriores"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-jrs-black/60" />
        <div className="relative z-10 text-center px-4 mt-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Entre em Contacto
          </h1>
          <p className="text-slate-200 text-lg md:text-xl font-light">
            Visite as nossas instalações ou fale connosco para obter soluções à medida para a sua obra.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 flex-1 -mt-20 relative z-20">
        <div className="max-w-6xl mx-auto rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row bg-white">
          
          {/* Informações de Contacto - Coluna Esquerda */}
          <div className="w-full lg:w-2/5 p-10 lg:p-12 text-white flex flex-col justify-between bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="h-full flex flex-col">
              <div className="mb-12">
                <h2 className="text-3xl font-display font-bold mb-4 tracking-tight text-white">Informações</h2>
                <p className="text-slate-400 font-light text-base leading-relaxed">
                  Estamos disponíveis para esclarecer as suas dúvidas e fornecer orçamentos personalizados de forma célere.
                </p>
              </div>

              <div className="space-y-10 flex-1">
                {/* Localização */}
                <div className="flex items-start group">
                  <div className="mt-1 h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 transition-colors group-hover:bg-slate-700">
                    <MapPin className="h-5 w-5 text-jrs-green-start" />
                  </div>
                  <div className="ml-5">
                    <h3 className="font-semibold text-lg tracking-wide mb-1 text-slate-100">Morada</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[260px]">
                      {COMPANY_INFO.addressDisplay}
                    </p>
                    <a
                      href={COMPANY_INFO.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-3 text-sm font-medium text-jrs-green-start hover:text-jrs-green-end transition-colors"
                    >
                      Ver no Google Maps <ArrowRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Telefones */}
                <div className="flex items-start group">
                  <div className="mt-1 h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 transition-colors group-hover:bg-slate-700">
                    <Phone className="h-5 w-5 text-jrs-green-start" />
                  </div>
                  <div className="ml-5">
                    <h3 className="font-semibold text-lg tracking-wide mb-3 text-slate-100">Telefones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-3 text-slate-500" />
                        <a href={`tel:${COMPANY_INFO.phoneWarehouse}`} className="text-slate-400 text-sm hover:text-white transition-colors block">
                          {COMPANY_INFO.phoneWarehouse} <span className="opacity-60 ml-1">(Armazém)</span>
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-3 text-slate-500" />
                        <a href={`tel:${COMPANY_INFO.mobileWarehouse}`} className="text-slate-400 text-sm hover:text-white transition-colors block">
                          {COMPANY_INFO.mobileWarehouse} <span className="opacity-60 ml-1">(Móvel)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start group">
                  <div className="mt-1 h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 transition-colors group-hover:bg-slate-700">
                    <Mail className="h-5 w-5 text-jrs-green-start" />
                  </div>
                  <div className="ml-5">
                    <h3 className="font-semibold text-lg tracking-wide mb-1 text-slate-100">Email</h3>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-400 block mt-1 text-sm hover:text-white transition-colors break-all">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start group">
                  <div className="mt-1 h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 transition-colors group-hover:bg-slate-700">
                    <Clock className="h-5 w-5 text-jrs-green-start" />
                  </div>
                  <div className="ml-5">
                    <h3 className="font-semibold text-lg tracking-wide mb-1 text-slate-100">Horário</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mt-1">
                      Segunda a Sexta:<br/>
                      <span className="font-medium text-slate-300">08:00 - 12:30 / 14:00 - 18:00</span>
                    </p>
                    <p className="text-slate-500 mt-2 text-xs font-medium uppercase tracking-wider">
                      Encerrado ao fim de semana
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pedido de Orçamento - Coluna Direita (Form) */}
          <div className="w-full lg:w-3/5 p-10 lg:p-14 bg-white">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2 tracking-tight">Pedir Orçamento</h2>
            <p className="text-slate-500 mb-10 font-light text-base">
              Preencha o formulário abaixo e entraremos em contacto o mais brevemente possível.
            </p>

            {isSuccess ? (
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-500 h-[450px] flex flex-col justify-center items-center">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm ring-8 ring-green-50/50">
                  <Send className="h-10 w-10 ml-1.5" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Mensagem Enviada!</h3>
                <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
                  Obrigado pelo seu contacto. A nossa equipa irá analisar o seu pedido e responder no prazo mais curto possível.
                </p>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full px-8 h-12 font-medium"
                  onClick={() => setIsSuccess(false)}
                >
                  Enviar nova mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Nome / Empresa <span className="text-jrs-green-start">*</span></label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Construções Silva Lda"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:border-jrs-green-start focus:ring-jrs-green-start/20 rounded-xl h-12 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Telefone <span className="text-jrs-green-start">*</span></label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Ex: 912 345 678"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:border-jrs-green-start focus:ring-jrs-green-start/20 rounded-xl h-12 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email <span className="text-jrs-green-start">*</span></label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ex: geral@empresa.pt"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 focus:border-jrs-green-start focus:ring-jrs-green-start/20 rounded-xl h-12 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700">Mensagem / Pedido de Orçamento <span className="text-jrs-green-start">*</span></label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Descreva os materiais que necessita (ex: 50 varões de 12mm...)"
                    className="min-h-[160px] bg-slate-50 border-slate-200 focus:border-jrs-green-start focus:ring-jrs-green-start/20 rounded-xl shadow-sm p-4"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-semibold tracking-wide bg-gradient-to-r from-jrs-green-start to-jrs-green-end hover:opacity-90 transition-all duration-300 rounded-xl h-14 shadow-lg shadow-jrs-green-start/20 hover:shadow-jrs-green-start/30"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        A enviar pedido...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Enviar Pedido <Send className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-6">
                    Garantimos uma resposta no prazo de 24 horas úteis.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
