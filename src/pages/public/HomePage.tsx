import { useState, useMemo } from 'react';
import { useKits } from '../../hooks/useKits';
import { KitCard } from './KitCard';
import { Search, Filter, SlidersHorizontal, Package, User, Star, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { KitItemType } from '../../types';

export function HomePage() {
  const { kits, loading } = useKits(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<KitItemType | 'all'>('all');
  const [selectedTheme, setSelectedTheme] = useState('all');

  const themes = useMemo(() => {
    const allThemes = kits.map(k => k.tema).filter(Boolean);
    return ['all', ...Array.from(new Set(allThemes))];
  }, [kits]);

  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      const matchesSearch = kit.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          kit.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kit.codigo_produto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || kit.tipo === selectedType;
      const matchesTheme = selectedTheme === 'all' || kit.tema === selectedTheme;
      return matchesSearch && matchesType && matchesTheme;
    });
  }, [kits, searchTerm, selectedType, selectedTheme]);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5A5A40] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-celebration-cream/30">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-white">
        {/* Aurora / Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[10%] h-[70%] w-[70%] rounded-full bg-celebration-pink/15 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -right-[10%] top-[20%] h-[60%] w-[60%] rounded-full bg-celebration-purple/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute left-[20%] -bottom-[20%] h-[50%] w-[50%] rounded-full bg-celebration-gold/10 blur-[80px]" />
        </div>
        
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center items-center text-center px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[4px] text-celebration-pink bg-celebration-pink/5 px-4 py-1.5 rounded-full border border-celebration-pink/10">
              LM Decor Celebrações
            </span>
            <h1 className="mb-6 font-serif text-5xl leading-tight text-celebration-ink md:text-7xl lg:text-8xl italic">
              Transformamos sonhos em <span className="text-celebration-pink underline decoration-celebration-pink/20 underline-offset-8">cenários mágicos</span>.
            </h1>
            <p className="mb-10 text-lg md:text-xl text-celebration-muted font-light leading-relaxed max-w-2xl mx-auto">
              Curadoria exclusiva de kits e itens para festas que tornam cada celebração um evento memorável e sofisticado.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#catalogo" className="bg-celebration-pink px-12 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:scale-105 shadow-xl shadow-celebration-pink/20">
                Explorar Catálogo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div id="catalogo" className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:py-24">
      {/* Hero / Intro */}
      <div className="mb-12 md:mb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-5xl lg:text-7xl font-light tracking-tight text-editorial-ink"
        >
          Alugue e decore seu momento.
        </motion.h1>
        <div className="mx-auto mt-6 md:mt-8 h-px w-16 md:w-24 bg-editorial-accent"></div>
      </div>

      {/* Filters & Search */}
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 md:gap-6 md:items-end">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 text-editorial-muted" />
            <input 
              type="text" 
              placeholder="BUSCAR NO CATÁLOGO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-b border-editorial-border bg-transparent py-3 md:py-4 pl-9 pr-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] outline-none transition-all focus:border-editorial-accent"
            />
          </div>

          {/* Filters Group */}
          <div className="grid grid-cols-2 gap-4 md:flex md:gap-6">
            {/* Type Filter */}
            <div className="flex flex-col gap-1 md:gap-2">
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[1px] md:tracking-[2px] text-editorial-muted ml-1">Coleção</span>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="cursor-pointer border-b border-editorial-border bg-transparent py-3 md:py-4 px-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] outline-none transition-all focus:border-editorial-accent"
              >
                <option value="all">TODAS</option>
                <option value="kit_completo">KITS</option>
                <option value="item_avulso">AVULSOS</option>
                <option value="painel">PAINÉIS</option>
                <option value="mesa">MESAS</option>
                <option value="bolos_fakes">BOLOS FAKES</option>
                <option value="outros">OUTROS</option>
              </select>
            </div>

            {/* Theme Filter */}
            <div className="flex flex-col gap-1 md:gap-2">
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[1px] md:tracking-[2px] text-editorial-muted ml-1">Tema</span>
              <select 
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="cursor-pointer border-b border-editorial-border bg-transparent py-3 md:py-4 px-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] outline-none transition-all focus:border-editorial-accent"
              >
                <option value="all">TODOS</option>
                {themes.filter(t => t !== 'all').map(theme => (
                  <option key={theme} value={theme}>{theme.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted border-t md:border-none pt-4 md:pt-0">
          <span className="text-editorial-ink">{filteredKits.length}</span> Peças Disponíveis
        </div>
      </div>


      {/* Grid */}
      {filteredKits.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredKits.map((kit, index) => (
            <KitCard key={kit.id} kit={kit} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 py-24 text-center">
          <LayoutGrid className="mb-4 h-12 w-12 text-[#1a1a1a]/10" />
          <h3 className="text-lg font-medium text-[#1a1a1a]">Nenhum item encontrado</h3>
          <p className="mt-2 text-sm text-[#1a1a1a]/40">Tente ajustar seus filtros ou busca.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedType('all'); setSelectedTheme('all'); }}
            className="mt-6 text-sm font-medium text-[#5A5A40] underline underline-offset-4 hover:opacity-70"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  </div>
);
}
