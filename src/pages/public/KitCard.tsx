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

  const whatsappMessage = `Olá! Gostaria de um orçamento para o item: ${kit.titulo}\nCódigo: ${kit.codigo_produto}\nTema: ${kit.tema || 'Neutro'}`;
  const whatsappNumber = '5532985179487';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

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

        <div className="mt-auto pt-6 border-t border-celebration-border/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase tracking-[1px] text-celebration-pink/60">Sob Consulta</span>
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-pink animate-pulse">Orçamento</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.preventDefault(); addToCart(kit); }}
                className="flex h-10 w-10 items-center justify-center border border-celebration-pink/20 bg-celebration-pink/5 text-celebration-pink transition-all hover:bg-celebration-pink hover:text-white rounded-full"
                title="Adicionar ao carrinho"
              >
                <Plus size={18} />
              </button>
              
              <Link 
                to={`/produto/${kit.id}`}
                className="flex h-10 w-10 items-center justify-center border border-celebration-border text-celebration-muted transition-all hover:bg-celebration-ink hover:text-white rounded-full"
                title="Ver detalhes"
              >
                <Eye size={18} />
              </Link>

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center bg-celebration-pink text-white transition-all hover:scale-105 rounded-full shadow-lg shadow-celebration-pink/20"
                title="Solicitar via WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
