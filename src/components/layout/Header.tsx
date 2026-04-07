import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { COMPANY_INFO } from '@/src/constants';
import { BrandLogo } from '@/src/components/layout/BrandLogo';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Sobre Nós', path: '/sobre-nos' },
    { name: 'Produtos', path: '/produtos' },
    { name: 'Contactos', path: '/contactos' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-slate-200 py-2 shadow-sm'
          : 'bg-white border-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <BrandLogo
          imageClassName="h-11 w-11 rounded-md"
          labelClassName="text-jrs-black"
          taglineClassName="text-slate-500"
        />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-jrs-green-start relative py-1',
                location.pathname === link.path
                  ? 'text-jrs-green-start after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-jrs-green-start'
                  : 'text-slate-600'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <a href={`tel:${COMPANY_INFO.phoneWarehouse}`} className="text-xs font-semibold text-slate-900 flex items-center gap-1 hover:text-jrs-green-start transition-colors">
              <Phone className="h-3 w-3" />
              {COMPANY_INFO.phoneWarehouse}
            </a>
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-xs text-slate-500 flex items-center gap-1 hover:text-jrs-green-start transition-colors">
              <Mail className="h-3 w-3" />
              {COMPANY_INFO.email}
            </a>
          </div>
          <Button asChild className="bg-gradient-to-r from-jrs-green-start to-jrs-green-end hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all">
            <Link to="/contactos">Pedir Orçamento</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-base font-medium py-2 border-b border-slate-100',
                location.pathname === link.path ? 'text-jrs-green-start' : 'text-slate-600'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <a href={`tel:${COMPANY_INFO.phoneWarehouse}`} className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-slate-50 rounded-md">
              <Phone className="h-4 w-4" />
              Ligar: {COMPANY_INFO.phoneWarehouse}
            </a>
            <Button asChild className="w-full bg-gradient-to-r from-jrs-green-start to-jrs-green-end">
              <Link to="/contactos" onClick={() => setIsMobileMenuOpen(false)}>
                Pedir Orçamento
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
