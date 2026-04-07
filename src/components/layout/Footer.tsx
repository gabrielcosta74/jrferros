import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, Facebook, Linkedin } from 'lucide-react';
import { COMPANY_INFO } from '@/src/constants';
import { BrandLogo } from '@/src/components/layout/BrandLogo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <BrandLogo
              imageClassName="h-14 w-14 rounded-md"
              labelClassName="text-white"
              taglineClassName="text-slate-500"
            />
            <p className="text-sm text-slate-400 leading-relaxed">
              {COMPANY_INFO.tagline}
            </p>
            {(COMPANY_INFO.facebookUrl || COMPANY_INFO.linkedinUrl) && (
              <div className="flex gap-4 pt-2">
                {COMPANY_INFO.facebookUrl && (
                  <a href={COMPANY_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-jrs-green-start transition-colors" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {COMPANY_INFO.linkedinUrl && (
                  <a href={COMPANY_INFO.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-jrs-green-start transition-colors" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-jrs-green-start transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-jrs-green-start" />
                  Início
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-sm hover:text-jrs-green-start transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-jrs-green-start" />
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/contactos" className="text-sm hover:text-jrs-green-start transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-jrs-green-start" />
                  Pedir Orçamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">Produtos Principais</h3>
            <ul className="space-y-2">
              <li className="text-sm hover:text-jrs-green-start transition-colors cursor-pointer">Varão para Betão</li>
              <li className="text-sm hover:text-jrs-green-start transition-colors cursor-pointer">Malhas Eletrosoldadas</li>
              <li className="text-sm hover:text-jrs-green-start transition-colors cursor-pointer">Tubos Quadrados</li>
              <li className="text-sm hover:text-jrs-green-start transition-colors cursor-pointer">Perfis IPE</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">Contactos</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-jrs-green-start shrink-0 mt-0.5" />
                <span className="text-sm">{COMPANY_INFO.addressDisplay}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-jrs-green-start shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${COMPANY_INFO.phoneWarehouse}`} className="text-sm hover:text-white transition-colors">{COMPANY_INFO.phoneWarehouse}</a>
                  <a href={`tel:${COMPANY_INFO.mobileWarehouse}`} className="text-sm hover:text-white transition-colors">{COMPANY_INFO.mobileWarehouse}</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-jrs-green-start shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="text-sm hover:text-white transition-colors">{COMPANY_INFO.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} {COMPANY_INFO.name}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Termos e Condições</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
