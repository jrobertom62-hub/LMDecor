import { KitItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { motion } from 'motion/react';
import { MessageCircle, Eye, Plus } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { SiteConfig } from '../../types';
import { useCart } from '../../context/CartContext';

interface KitCardProps {
  kit: KitItem;
  index: number;
}

export function KitCard({ kit, index }: KitCardProps) {
  const { config } = useOutletContext<{ config: SiteConfig }>();
  const { addToCart } = useCart();

  const whatsappMessage = `Olá! Gostaria de saber mais sobre o item: ${kit.titulo} (Código: ${kit.codigo_produto})`;
  const whatsappUrl = config?.whatsapp 
    ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.8 }}
      className="group flex flex-col bg-white border border-celebration-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-celebration-pink/10 transition-all duration-500"
    >
      {/* Image Container */}
      <Link to={`/produto/${kit.id}`} className="relative aspect-[4/5] overflow-hidden bg-editorial-bg-admin block">
        <img 
          src={kit.capa_url || 'https://placehold.co/600x800?text=Sem+Foto'} 
          alt={kit.titulo}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {kit.destaque && (
            <span className="bg-celebration-pink px-3 py-1 text-[8px] font-bold uppercase tracking-[2px] text-white rounded-full shadow-lg">
              Destaque
            </span>
          )}
          <span className="w-fit border border-celebration-border bg-white/80 backdrop-blur-md px-3 py-1 text-[8px] font-bold uppercase tracking-[2px] text-celebration-ink rounded-full">
            {kit.tipo.replace('_', ' ')}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-editorial-ink/10 opacity-0 transition-opacity group-hover:opacity-100">
           <div className="bg-white px-6 py-3 text-[9px] font-bold uppercase tracking-[2px] text-editorial-ink shadow-xl">
             Ver Detalhes
           </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-grow flex-col p-4 sm:p-6">
        <div className="mb-2 flex flex-col gap-1">
          <Link to={`/produto/${kit.id}`} className="font-serif text-base sm:text-lg leading-tight text-editorial-ink hover:text-editorial-accent transition-colors line-clamp-2">
            {kit.titulo}
          </Link>
          <span className="text-[9px] font-bold font-mono text-editorial-muted">CÓD: {kit.codigo_produto}</span>
        </div>

        <p className="mb-6 text-[10px] uppercase tracking-wider text-editorial-muted leading-relaxed">
          {kit.tema || 'Neutro'} {kit.dimensoes ? `• ${kit.dimensoes}` : ''}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6 border-t border-editorial-border/30">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[2px] text-editorial-muted mb-1">Locação</span>
            <span className="text-base sm:text-xl font-bold tracking-tight text-editorial-accent italic">
              {formatCurrency(kit.preco_locacao)}
            </span>
          </div>
          
          <div className="flex gap-1.5 sm:gap-2">
            <button 
              onClick={() => addToCart(kit)}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center border border-celebration-pink bg-white text-celebration-pink transition-all hover:bg-celebration-pink hover:text-white rounded-full shadow-lg shadow-celebration-pink/5"
              title="Adicionar ao carrinho"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <Link 
              to={`/produto/${kit.id}`}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center border border-celebration-border text-celebration-muted transition-all hover:border-celebration-ink hover:text-editorial-ink rounded-full"
              title="Ver detalhes"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center border border-celebration-pink bg-celebration-pink text-white transition-all hover:bg-transparent hover:text-celebration-pink rounded-full shadow-lg shadow-celebration-pink/20"
              title="Solicitar via WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
