import { Link } from 'react-router-dom';
import { SiteConfig } from '../../types';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  config: SiteConfig | null;
}

export function Navbar({ config }: NavbarProps) {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-celebration-border bg-gradient-to-r from-celebration-cream via-white to-celebration-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-6 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          {(config?.logo_url || '/logolmdecor.png') ? (
            <img src={config?.logo_url || '/logolmdecor.png'} alt={config?.nome_empresa || 'LM Decor'} className="h-10 w-auto md:h-12 object-contain" />
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

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/carrinho" 
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-celebration-border bg-white text-celebration-ink transition-all hover:border-celebration-pink hover:text-celebration-pink shadow-sm"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-celebration-pink text-[10px] font-bold text-white shadow-lg animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Link>

          <Link 
            to="/admin" 
            className="rounded-full border border-celebration-ink px-3 py-1.5 md:px-5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[1px] text-celebration-ink transition-all hover:bg-celebration-ink hover:text-white"
          >
            Painel Admin
          </Link>
        </div>
      </div>
    </header>

  );
}
