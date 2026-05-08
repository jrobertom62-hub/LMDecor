import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { KitItem, SiteConfig } from '../../types';
import { motion } from 'motion/react';
import { MessageCircle, ChevronLeft, Package, Ruler, Palette, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useOutletContext<{ config: SiteConfig }>();
  const [product, setProduct] = useState<KitItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('kits_e_itens')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data && data.publicado) {
          setProduct(data as KitItem);
          setActiveMedia(data.capa_url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-editorial-ink border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center md:px-8">
        <AlertCircle className="mx-auto mb-6 h-12 w-12 text-editorial-muted/30" />
        <h2 className="font-serif text-3xl text-editorial-ink italic">Produto indisponível</h2>
        <p className="mt-4 text-editorial-muted">Este item não está mais disponível no catálogo ou o link está incorreto.</p>
        <Link to="/" className="mt-12 inline-block border border-editorial-ink px-10 py-4 text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink transition-all hover:bg-editorial-ink hover:text-white">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const allMedia = [
    product.capa_url, 
    ...(product.fotos || []),
    ...(product.videos || [])
  ].filter(Boolean);

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('/videos/');
  };

  const whatsappMessage = `Olá! Tenho interesse no kit/item código ${product.codigo_produto}. Pode me passar mais informações? (Item: ${product.titulo})`;
  const whatsappUrl = config?.whatsapp 
    ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:py-24">
      <button 
        onClick={handleBack} 
        className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted transition-colors hover:text-editorial-ink"
      >
        <ChevronLeft size={14} /> Voltar
      </button>

      <div className="grid gap-16 lg:grid-cols-2">
        {/* Gallery/Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="aspect-[4/5] overflow-hidden bg-neutral-100 border border-editorial-border relative">
            {activeMedia && isVideo(activeMedia) ? (
              <video 
                src={activeMedia} 
                controls 
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
              />
            ) : (
              <img 
                src={activeMedia || 'https://placehold.co/800x1000?text=Sem+Foto'} 
                alt={product.titulo}
                className="h-full w-full object-cover transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          
          {allMedia.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {allMedia.map((media, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveMedia(media)}
                  className={cn(
                    "aspect-square border transition-all overflow-hidden relative",
                    activeMedia === media ? "border-editorial-ink scale-95" : "border-editorial-border hover:border-editorial-accent"
                  )}
                >
                  {isVideo(media) ? (
                    <div className="relative h-full w-full bg-black flex items-center justify-center">
                      <video src={media} className="h-full w-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/20 p-1 backdrop-blur-sm">
                          <Eye className="text-white h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={media} className="h-full w-full object-cover" alt={`Thumb ${idx}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex flex-wrap gap-3 mb-6">
             <span className="bg-editorial-bg-admin px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-editorial-muted border border-editorial-border">
              {product.tipo.replace('_', ' ')}
            </span>
            {product.destaque && (
              <span className="bg-editorial-ink px-3 py-1 text-[9px] font-bold uppercase tracking-[2px] text-white">
                Destaque Especial
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl text-editorial-ink md:text-5xl lg:text-6xl leading-tight">
            {product.titulo}
          </h1>
          
          <div className="mt-4 flex items-center gap-3">
             <span className="text-[10px] font-bold font-mono text-editorial-muted border border-editorial-border px-3 py-1 bg-neutral-50">
               CÓD: {product.codigo_produto}
             </span>
          </div>

          <div className="mt-10 mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted block mb-2">Locação</span>
            <span className="text-4xl font-light tracking-tighter text-editorial-accent italic">
              {formatCurrency(product.preco_locacao)}
            </span>
          </div>

          <div className="my-10 h-px w-full bg-editorial-border"></div>

          <div className="space-y-8">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink mb-4">Sobre este item</h3>
              <p className="text-editorial-muted text-sm leading-relaxed whitespace-pre-wrap">
                {product.descricao || 'Sem descrição detalhada disponível.'}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
               {product.tema && (
                <div className="flex items-start gap-3">
                  <Tag className="text-editorial-accent shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink">Tema</h4>
                    <p className="text-sm text-editorial-muted">{product.tema}</p>
                  </div>
                </div>
               )}
               {product.dimensoes && (
                <div className="flex items-start gap-3">
                  <Ruler className="text-editorial-accent shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink">Dimensões</h4>
                    <p className="text-sm text-editorial-muted">{product.dimensoes}</p>
                  </div>
                </div>
               )}
               {product.cores && product.cores.length > 0 && (
                <div className="flex items-start gap-3">
                  <Palette className="text-editorial-accent shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink">Cores</h4>
                    <p className="text-sm text-editorial-muted">{product.cores.join(', ')}</p>
                  </div>
                </div>
               )}
            </div>

            {product.itens_inclusos && (
              <div className="bg-editorial-bg-admin p-8 border border-editorial-border rounded-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-editorial-ink" size={16} />
                  <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">O que está incluso:</h4>
                </div>
                <div className="text-sm text-editorial-muted whitespace-pre-wrap">
                  {product.itens_inclusos}
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-editorial-ink px-12 py-5 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              <MessageCircle size={18} />
              Solicitar Locação
            </a>
            
            <div className="flex items-center gap-2 text-emerald-600">
               <CheckCircle2 size={16} />
               <span className="text-[10px] font-bold uppercase tracking-[1px]">Item Disponível</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
