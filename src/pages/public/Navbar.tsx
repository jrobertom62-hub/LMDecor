import { Link } from 'react-router-dom';
import { SiteConfig } from '../../types';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  config: SiteConfig | null;
}

export function Navbar({ config }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-editorial-border bg-editorial-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-6 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          {config?.logo_url ? (
            <img src={config.logo_url} alt={config.nome_empresa} className="h-7 w-auto md:h-10 object-contain" />
          ) : (
            <span className="font-serif text-xl md:text-2xl italic tracking-tight text-editorial-ink">
              {config?.nome_empresa || 'LM Decor'}
            </span>
          )}
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink hover:text-editorial-accent transition-colors">
            Catálogo
          </Link>
          <a href="#contato" className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink hover:text-editorial-accent transition-colors">
            Contato
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="rounded-sm border border-editorial-ink px-3 py-1.5 md:px-5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink transition-all hover:bg-editorial-ink hover:text-white"
          >
            Painel Admin
          </Link>
        </div>
      </div>
    </header>

  );
}
