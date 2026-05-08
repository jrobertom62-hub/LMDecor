import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../lib/utils';
import { useOutletContext, Link } from 'react-router-dom';
import { SiteConfig } from '../../types';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, totalValue, cartCount, clearCart } = useCart();
  const { config } = useOutletContext<{ config: SiteConfig }>();

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let message = `Olá! Gostaria de solicitar um orçamento para os seguintes itens:\n\n`;
    cart.forEach(item => {
      message += `• ${item.titulo} (Qtd: ${item.quantity}) - Código: ${item.codigo_produto}\n`;
    });
    message += `\n*Por favor, me envie um orçamento para estes itens!*`;

    const whatsappNumber = '5532985179487';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-celebration-cream/30 flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-celebration-pink/10">
            <ShoppingCart className="h-10 w-10 text-celebration-pink/30" />
          </div>
          <h2 className="font-serif text-3xl text-celebration-ink mb-4">Seu carrinho está vazio</h2>
          <p className="text-celebration-muted mb-8 max-w-xs mx-auto">Parece que você ainda não escolheu os itens para sua festa.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-celebration-pink px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:scale-105 shadow-xl shadow-celebration-pink/20"
          >
            <ArrowLeft size={14} /> Voltar ao Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celebration-cream/30 py-12 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <header className="mb-12 flex items-end justify-between border-b border-celebration-border pb-8">
          <div>
            <h1 className="font-serif text-4xl text-celebration-ink italic">Seu Carrinho</h1>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-celebration-muted mt-2">
              {cartCount} {cartCount === 1 ? 'Item selecionado' : 'Itens selecionados'}
            </p>
          </div>
          <button 
            onClick={clearCart}
            className="text-[10px] font-bold uppercase tracking-[1px] text-red-400 hover:text-red-600 transition-colors"
          >
            Esvaziar
          </button>
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 md:gap-6 bg-white p-4 md:p-6 border border-celebration-border rounded-2xl shadow-sm"
              >
                <Link to={`/produto/${item.id}`} className="h-24 w-20 md:h-32 md:w-28 shrink-0 overflow-hidden rounded-xl bg-celebration-bg-admin">
                  <img src={item.capa_url} alt={item.titulo} className="h-full w-full object-cover" />
                </Link>
                
                <div className="flex flex-grow flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link to={`/produto/${item.id}`} className="font-serif text-lg text-celebration-ink hover:text-celebration-pink transition-colors">
                        {item.titulo}
                      </Link>
                      <p className="text-[9px] font-bold font-mono text-celebration-muted uppercase tracking-wider mt-1">CÓD: {item.codigo_produto}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-celebration-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 border border-celebration-border rounded-full p-1 bg-celebration-cream/20">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold text-celebration-pink">Solicitar Orçamento</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white p-8 border border-celebration-border rounded-3xl shadow-xl shadow-celebration-pink/5">
              <h3 className="font-serif text-xl text-celebration-ink mb-6">Resumo</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-celebration-muted">Quantidade de Itens</span>
                  <span className="font-medium text-celebration-ink">{cartCount}</span>
                </div>
                <div className="pt-4 border-t border-celebration-border flex justify-between">
                  <span className="font-bold text-celebration-ink italic">Orçamento no WhatsApp</span>
                </div>
              </div>

              <button 
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-3 bg-celebration-pink py-5 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:scale-[1.02] shadow-xl shadow-celebration-pink/20"
              >
                <MessageCircle size={18} /> Solicitar Orçamento
              </button>
              <p className="mt-4 text-[9px] text-center text-celebration-muted leading-relaxed italic">
                *O valor final será confirmado via WhatsApp, considerando disponibilidade e frete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
