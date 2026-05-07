import { Link } from 'react-router-dom';
import { SiteConfig } from '../../types';
import { Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  config: SiteConfig | null;
}

export function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contato" className="border-t border-editorial-border bg-white pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-16 md:grid-cols-3">
          <div className="space-y-8">
            <h3 className="font-serif text-2xl italic text-editorial-ink">
              {config?.nome_empresa || 'LM Decor'}
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-editorial-muted">
              Curadoria de decorações para tornar seus eventos verdadeiramente memoráveis.
            </p>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-accent">Contato</h4>
            <ul className="space-y-6">
              {config?.endereco_texto && (
                <li className="flex gap-4 text-sm text-editorial-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-editorial-accent" />
                  <span className="leading-relaxed">{config.endereco_texto}</span>
                </li>
              )}
              {config?.whatsapp && (
                <li className="flex gap-4 text-sm text-editorial-muted">
                  <Phone className="h-4 w-4 shrink-0 text-editorial-accent" />
                  <span>{config.whatsapp}</span>
                </li>
              )}
              {config?.email && (
                <li className="flex gap-4 text-sm text-editorial-muted">
                  <Mail className="h-4 w-4 shrink-0 text-editorial-accent" />
                  <span>{config.email}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-accent">Institucional</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/politica-de-privacidade" className="text-sm text-editorial-muted hover:text-editorial-accent transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="text-sm text-editorial-muted hover:text-editorial-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookies" className="text-sm text-editorial-muted hover:text-editorial-accent transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 border-t border-editorial-border pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-medium uppercase tracking-wider text-editorial-muted/50">
            © {currentYear} {config?.nome_empresa || 'LM Decor'}. All rights reserved.
          </p>
          {config?.google_maps_url && (
            <a 
              href={config.google_maps_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-accent hover:underline"
            >
              Google Maps Location
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
