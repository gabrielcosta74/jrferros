import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Card, CardContent } from '@/src/components/ui/card';
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
      {/* Hero Section para Contactos */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img
          src="/imagensferros/companyfromoutsideview.jpeg"
          alt="JRS Ferros Instalações Exteriores"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-jrs-black/60" />
        <div className="relative z-10 text-center px-4 mt-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">Entre em Contacto</h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto">
            Visite as nossas instalações ou fale connosco para soluções à medida.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12 hidden md:block">
          <p className="text-slate-600 text-lg">
            Estamos disponíveis para esclarecer as suas dúvidas e fornecer orçamentos personalizados para a sua obra.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-jrs-green-start to-jrs-green-end"></div>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-jrs-green-start/10 flex items-center justify-center text-jrs-green-start shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">Morada</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {COMPANY_INFO.addressDisplay}
                    </p>
                    <a
                      href={COMPANY_INFO.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-jrs-green-start font-medium hover:underline mt-2 inline-block"
                    >
                      Ver no Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-jrs-green-start/10 flex items-center justify-center text-jrs-green-start shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">Telefones</h3>
                    <div className="space-y-1">
                      <p className="text-slate-600 text-sm">
                        <span className="font-medium text-slate-900">Armazém:</span> <a href={`tel:${COMPANY_INFO.phoneWarehouse}`} className="hover:text-jrs-green-start">{COMPANY_INFO.phoneWarehouse}</a>
                      </p>
                      <p className="text-slate-600 text-sm">
                        <span className="font-medium text-slate-900">Móvel:</span> <a href={`tel:${COMPANY_INFO.mobileWarehouse}`} className="hover:text-jrs-green-start">{COMPANY_INFO.mobileWarehouse}</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-jrs-green-start/10 flex items-center justify-center text-jrs-green-start shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">Email</h3>
                    <p className="text-slate-600 text-sm">
                      <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-jrs-green-start">{COMPANY_INFO.email}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-jrs-green-start/10 flex items-center justify-center text-jrs-green-start shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">Horário</h3>
                    <p className="text-slate-600 text-sm">
                      Segunda a Sexta: 08:00 - 12:30 / 14:00 - 18:00
                    </p>
                    <p className="text-slate-600 text-sm">Encerrado ao sábado e domingo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-md bg-white h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6">Pedir Orçamento</h2>

                {isSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center animate-in fade-in duration-500">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                      <Send className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Mensagem Enviada!</h3>
                    <p className="text-green-700">
                      Obrigado pelo seu contacto. A nossa equipa irá responder ao seu pedido de orçamento o mais brevemente possível.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => setIsSuccess(false)}
                    >
                      Enviar nova mensagem
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Nome / Empresa</label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Ex: Construções Silva Lda"
                          required
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-700">Telefone</label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Ex: 912 345 678"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Ex: geral@empresa.pt"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-700">Mensagem / Pedido de Orçamento</label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Descreva os materiais que necessita (ex: 50 varões de 12mm, 10 tubos quadrados 40x40...)"
                        className="min-h-[150px]"
                        required
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full md:w-auto bg-gradient-to-r from-jrs-green-start to-jrs-green-end hover:opacity-90 text-white min-w-[200px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'A enviar...' : 'Enviar Pedido'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
