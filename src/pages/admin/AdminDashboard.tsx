import { useKits } from '../../hooks/useKits';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { Package, Globe, Eye, Phone, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { kits } = useKits(false);
  const { config } = useSiteConfig();

  const stats = [
    { label: 'Total de Itens', value: kits.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Itens no Site', value: kits.filter(k => k.publicado).length, icon: Globe, color: 'bg-emerald-500' },
    { label: 'Em Destaque', value: kits.filter(k => k.destaque).length, icon: TrendingUp, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-16">
      <header>
        <h2 className="text-3xl font-serif text-editorial-ink">Visão Geral</h2>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Relatórios e Status do Sistema</p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-px bg-editorial-border border border-editorial-border lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-6 bg-white p-10"
          >
            <div className={`flex h-12 w-12 items-center justify-center border border-editorial-border text-editorial-accent`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">{stat.label}</p>
              <h3 className="text-3xl font-medium tracking-tight text-editorial-ink">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-px bg-editorial-border border border-editorial-border lg:grid-cols-2">
        {/* Recent Items */}
        <div className="bg-white p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Itens Recentes</h3>
            <Link to="/admin/items" className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-accent hover:underline">Ver Todos</Link>
          </div>
          <div className="divide-y divide-editorial-border">
            {kits.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <img src={item.capa_url || 'https://placehold.co/100x100'} className="h-10 w-10 object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-sm font-medium text-editorial-ink">{item.titulo}</p>
                    <p className="text-xs text-editorial-muted">{formatCurrency(item.preco_locacao || 0)}</p>
                  </div>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${item.publicado ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
            ))}
            {kits.length === 0 && (
              <div className="py-8 text-center text-xs text-editorial-muted italic">Nenhum item cadastrado ainda.</div>
            )}
          </div>
        </div>

        {/* Quick Contacts */}
        <div className="bg-white p-10 space-y-8">
          <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Informações da Empresa</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-editorial-border text-editorial-accent">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-editorial-muted">Empresa</p>
                <p className="text-sm font-medium text-editorial-ink">{config?.nome_empresa || 'Não configurado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-editorial-border text-editorial-accent">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-editorial-muted">WhatsApp</p>
                <p className="text-sm font-medium text-editorial-ink">{config?.whatsapp || 'Não configurado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-editorial-border text-editorial-accent">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-editorial-muted">Última Atualização</p>
                <p className="text-sm font-medium text-editorial-ink">
                  {config?.updated_at ? new Date(config.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
            </div>
            <Link to="/admin/config" className="block text-center border border-editorial-ink py-4 text-[10px] font-bold uppercase tracking-[2px] text-editorial-ink hover:bg-editorial-ink hover:text-white transition-colors">
              Editar Configurações
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
