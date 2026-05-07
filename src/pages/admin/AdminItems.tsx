import { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useKits } from '../../hooks/useKits';
import { KitItem, KitItemType } from '../../types';
import { Plus, Pencil, Trash2, X, Check, Package, Tag, Layers, Search, Copy, Eye, EyeOff, Star, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function AdminItems() {
  const { kits, loading } = useKits(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KitItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<KitItemType | 'all'>('all');
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterPublicado, setFilterPublicado] = useState<'all' | 'sim' | 'nao'>('all');
  const [filterDestaque, setFilterDestaque] = useState<'all' | 'sim' | 'nao'>('all');

  const themes = useMemo(() => {
    const allThemes = kits.map(k => k.tema).filter(Boolean);
    return ['all', ...Array.from(new Set(allThemes))];
  }, [kits]);

  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      const matchSearch = 
        kit.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.codigo_produto.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = filterType === 'all' || kit.tipo === filterType;
      const matchTheme = filterTheme === 'all' || kit.tema === filterTheme;
      const matchPublicado = filterPublicado === 'all' || (filterPublicado === 'sim' ? kit.publicado : !kit.publicado);
      const matchDestaque = filterDestaque === 'all' || (filterDestaque === 'sim' ? kit.destaque : !kit.destaque);

      return matchSearch && matchType && matchTheme && matchPublicado && matchDestaque;
    });
  }, [kits, searchTerm, filterType, filterTheme, filterPublicado, filterDestaque]);

  const [formData, setFormData] = useState<Partial<KitItem>>({
    codigo_produto: '',
    titulo: '',
    descricao: '',
    tipo: 'kit_completo',
    tema: '',
    preco_locacao: 0,
    cores: [],
    dimensoes: '',
    itens_inclusos: '',
    capa_url: '',
    fotos: [],
    publicado: true,
    destaque: false,
  });

  const generateCode = (titulo: string, tipo: string) => {
    const prefix = tipo === 'kit_completo' ? 'KIT' : 'ITEM';
    const cleanTitle = titulo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toUpperCase()
      .slice(0, 10);
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${cleanTitle || 'PROD'}-${random}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, capa_url: publicUrl }));
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      setFormData(prev => ({ 
        ...prev, 
        fotos: [...(prev.fotos || []), ...newUrls] 
      }));
    } catch (error: any) {
      console.error('Gallery upload error:', error);
      alert('Erro ao subir galeria: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: (prev.fotos || []).filter((_, i) => i !== index)
    }));
  };

  const handleOpenForm = (item?: KitItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        fotos: item.fotos || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        codigo_produto: '',
        titulo: '',
        descricao: '',
        tipo: 'kit_completo',
        tema: '',
        preco_locacao: 0,
        cores: [],
        dimensoes: '',
        itens_inclusos: '',
        capa_url: '',
        fotos: [],
        publicado: true,
        destaque: false,
      });
    }
    setIsFormOpen(true);
  };
/* ... handleSave update ... */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo) {
      alert('O título é obrigatório!');
      return;
    }
    if (!formData.preco_locacao && formData.preco_locacao !== 0) {
      alert('O preço de locação é obrigatório!');
      return;
    }
    
    setSaving(true);
    try {
      let finalCode = formData.codigo_produto;
      
      if (!editingItem && !finalCode) {
        finalCode = generateCode(formData.titulo || '', formData.tipo || 'item_avulso');
      }

      // Check for code uniqueness
      if (!editingItem || finalCode !== editingItem.codigo_produto) {
        const { data: existing, error: checkError } = await supabase
          .from('kits_e_itens')
          .select('id')
          .eq('codigo_produto', finalCode)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
          alert('Este código de produto já existe. Por favor, use outro.');
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        codigo_produto: finalCode,
        updated_at: new Date().toISOString(),
      };

      if (editingItem) {
        const { error } = await supabase
          .from('kits_e_itens')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kits_e_itens')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      setIsFormOpen(false);
      alert('Item salvo com sucesso!');
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Erro ao salvar no banco de dados: ' + (error.message || 'Verifique as permissões de RLS no Supabase'));
    } finally {
      setSaving(false);
    }
  };


  const toggleStatus = async (item: KitItem, field: 'publicado' | 'destaque') => {
    try {
      const { error } = await supabase
        .from('kits_e_itens')
        .update({
          [field]: !item[field],
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      const { error } = await supabase
        .from('kits_e_itens')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erro ao excluir item.');
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif text-editorial-ink">Kits e Itens</h2>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Gestão de Acervo e Disponibilidade</p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-editorial-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 active:scale-95"
        >
          <Plus size={16} /> Adicionar Novo
        </button>
      </header>

      {/* Filters Bar */}
      <div className="grid gap-4 rounded-sm border border-editorial-border bg-white p-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-editorial-muted" />
          <input 
            type="text" 
            placeholder="BUSCAR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-b border-editorial-border bg-transparent py-2 pl-9 text-[10px] font-bold uppercase tracking-[1px] outline-none focus:border-editorial-accent"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="border-b border-editorial-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-[1px] outline-none"
        >
          <option value="all">TODOS OS TIPOS</option>
          <option value="kit_completo">KITS COMPLETOS</option>
          <option value="item_avulso">ITENS AVULSOS</option>
          <option value="painel">PAINÉIS</option>
          <option value="mesa">MESAS</option>
          <option value="baloes">BALÕES</option>
          <option value="outros">OUTROS</option>
        </select>
        <select 
          value={filterTheme}
          onChange={(e) => setFilterTheme(e.target.value)}
          className="border-b border-editorial-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-[1px] outline-none"
        >
          <option value="all">TODOS OS TEMAS</option>
          {themes.filter(t => t !== 'all').map(t => (
            <option key={t} value={t}>{t.toUpperCase()}</option>
          ))}
        </select>
        <select 
          value={filterPublicado}
          onChange={(e) => setFilterPublicado(e.target.value as any)}
          className="border-b border-editorial-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-[1px] outline-none"
        >
          <option value="all">STATUS: TODOS</option>
          <option value="sim">PUBLICADOS</option>
          <option value="nao">OCULTOS</option>
        </select>
        <select 
          value={filterDestaque}
          onChange={(e) => setFilterDestaque(e.target.value as any)}
          className="border-b border-editorial-border bg-transparent py-2 text-[10px] font-bold uppercase tracking-[1px] outline-none"
        >
          <option value="all">DESTAQUE: TODOS</option>
          <option value="sim">EM DESTAQUE</option>
          <option value="nao">NORMAIS</option>
        </select>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-editorial-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-4xl overflow-hidden bg-editorial-bg-admin shadow-2xl border border-editorial-border"
            >
              <form onSubmit={handleSave} className="flex flex-col h-[90vh] md:h-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-editorial-border p-8 bg-white">
                  <h3 className="font-serif text-2xl text-editorial-ink italic">
                    {editingItem ? 'Editar Item' : 'Cadastrar Item'}
                  </h3>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 transition-colors hover:text-editorial-accent">
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto p-8 space-y-12 flex-grow">
                  {/* Bloco A: Informações Principais */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-editorial-border pb-4">
                      <Tag className="text-editorial-accent" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Informações Principais</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Título (Obrigatório)</label>
                        <input 
                          required
                          type="text" 
                          value={formData.titulo}
                          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                          placeholder="Ex: Kit Festa Safari Premium"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Tipo</label>
                        <select 
                          required
                          value={formData.tipo}
                          onChange={(e) => setFormData({...formData, tipo: e.target.value as KitItemType})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                        >
                          <option value="kit_completo">Kit Completo</option>
                          <option value="item_avulso">Item Avulso</option>
                          <option value="painel">Painel</option>
                          <option value="mesa">Mesa</option>
                          <option value="baloes">Balões</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Tema</label>
                        <input 
                          type="text" 
                          value={formData.tema}
                          onChange={(e) => setFormData({...formData, tema: e.target.value})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                          placeholder="Ex: Safari, Minimalista..."
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Preço de Locação</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={formData.preco_locacao}
                          onChange={(e) => setFormData({...formData, preco_locacao: Number(e.target.value)})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Código do Produto</label>
                        <input 
                          type="text" 
                          value={formData.codigo_produto}
                          onChange={(e) => setFormData({...formData, codigo_produto: e.target.value.toUpperCase()})}
                          placeholder="Gerado automaticamente se vazio"
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Descrição</label>
                        <textarea 
                          rows={3}
                          value={formData.descricao}
                          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco B: Detalhes */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-editorial-border pb-4">
                      <Layers className="text-editorial-accent" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Detalhes Técnicos</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Cores</label>
                        <input 
                          type="text" 
                          value={formData.cores?.join(', ')}
                          onChange={(e) => setFormData({...formData, cores: e.target.value.split(',').map(s => s.trim())})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                          placeholder="Ex: Azul, Branco, Dourado"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Dimensões</label>
                        <input 
                          type="text" 
                          value={formData.dimensoes}
                          onChange={(e) => setFormData({...formData, dimensoes: e.target.value})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                          placeholder="Ex: 2m x 1.5m"
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Itens Inclusos</label>
                        <textarea 
                          rows={3}
                          value={formData.itens_inclusos}
                          onChange={(e) => setFormData({...formData, itens_inclusos: e.target.value})}
                          className="border border-editorial-border bg-white px-4 py-3 text-sm outline-none focus:border-editorial-accent"
                          placeholder="Liste os itens que compõem este kit..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco C: Mídia */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-editorial-border pb-4">
                      <ImageIcon className="text-editorial-accent" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Mídia e Imagens</h4>
                    </div>
                    
                    <div className="grid gap-12 md:grid-cols-2">
                      {/* Capa Principal */}
                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Foto de Capa (Principal)</label>
                          <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="absolute inset-0 z-10 cursor-pointer opacity-0"
                              disabled={uploading}
                            />
                            <div className={cn(
                              "flex flex-col items-center justify-center border-2 border-dashed border-editorial-border bg-white aspect-video transition-all group-hover:border-editorial-accent",
                              uploading && "opacity-50"
                            )}>
                              {formData.capa_url ? (
                                <img src={formData.capa_url} className="h-full w-full object-cover" alt="Capa" />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="text-editorial-muted" size={24} />
                                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-editorial-muted">Subir Capa</span>
                                </div>
                              )}
                              {uploading && <Loader2 className="absolute animate-spin text-editorial-accent" size={24} />}
                            </div>
                          </div>
                        </div>
                        <input 
                          type="text" 
                          value={formData.capa_url}
                          onChange={(e) => setFormData({...formData, capa_url: e.target.value})}
                          className="w-full border border-editorial-border bg-white px-4 py-3 text-xs outline-none focus:border-editorial-accent"
                          placeholder="URL da imagem de capa"
                        />
                      </div>

                      {/* Galeria */}
                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Galeria de Fotos (Adicionais)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {formData.fotos?.map((url, idx) => (
                              <div key={idx} className="relative aspect-square border border-editorial-border group">
                                <img src={url} className="h-full w-full object-cover" alt={`Gallery ${idx}`} />
                                <button 
                                  type="button"
                                  onClick={() => removeGalleryImage(idx)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <div className="relative aspect-square border-2 border-dashed border-editorial-border flex items-center justify-center hover:border-editorial-accent transition-colors">
                              <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={handleGalleryUpload}
                                className="absolute inset-0 cursor-pointer opacity-0"
                                disabled={uploading}
                              />
                              <Plus size={20} className="text-editorial-muted" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco D: Exibição */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-editorial-border pb-4">
                      <Star className="text-editorial-accent" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Configurações de Exibição</h4>
                    </div>
                    <div className="flex flex-wrap gap-8">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={formData.publicado}
                          onChange={(e) => setFormData({...formData, publicado: e.target.checked})}
                          className="h-5 w-5 border-editorial-border accent-editorial-ink"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink">Publicar no Site</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={formData.destaque}
                          onChange={(e) => setFormData({...formData, destaque: e.target.checked})}
                          className="h-5 w-5 border-editorial-border accent-editorial-ink"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-ink">Destaque na Home</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-editorial-border p-8 bg-white flex justify-end gap-6">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-muted hover:text-editorial-ink transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-editorial-ink px-10 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? 'PROCESSANDO...' : editingItem ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <div className="bg-white border border-editorial-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-editorial-border bg-editorial-bg-admin">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted w-2/5">Kit / Item</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Código</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Locação</th>
                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border">
              {filteredKits.map((item) => (
                <tr key={item.id} className="hover:bg-editorial-bg-admin/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 shrink-0 border border-editorial-border bg-editorial-bg-admin overflow-hidden">
                        <img 
                          src={item.capa_url || 'https://placehold.co/100x100?text=Sem+Foto'} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-editorial-ink leading-tight">{item.titulo}</p>
                        <p className="text-[9px] font-bold uppercase tracking-[1px] text-editorial-muted mt-1">
                          {item.tipo.replace('_', ' ')} • {item.tema || 'Neutro'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 group">
                      <span className="text-[10px] font-bold font-mono text-editorial-ink">{item.codigo_produto}</span>
                      <button 
                        onClick={() => copyToClipboard(item.codigo_produto)}
                        className="text-editorial-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-editorial-accent"
                        title="Copiar código"
                      >
                        {copiedId === item.codigo_produto ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-medium text-editorial-ink">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_locacao)}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleStatus(item, 'publicado')}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-[1px] transition-colors",
                          item.publicado ? "text-emerald-700 bg-emerald-50" : "text-editorial-muted bg-neutral-100"
                        )}
                        title={item.publicado ? 'Clique para ocultar' : 'Clique para publicar'}
                      >
                        {item.publicado ? <Eye size={12} /> : <EyeOff size={12} />}
                        {item.publicado ? 'PUBLICADO' : 'OCULTO'}
                      </button>
                      <button 
                        onClick={() => toggleStatus(item, 'destaque')}
                        className={cn(
                          "p-1.5 transition-colors",
                          item.destaque ? "text-amber-500" : "text-editorial-muted hover:text-amber-400"
                        )}
                        title={item.destaque ? 'Remover destaque' : 'Tornar destaque'}
                      >
                        <Star size={16} fill={item.destaque ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <button 
                        onClick={() => handleOpenForm(item)}
                        className="text-editorial-muted hover:text-editorial-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-editorial-muted hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                   <td colSpan={5} className="px-10 py-10 h-24 bg-editorial-bg-admin/30" />
                </tr>
              ))}
              {!loading && filteredKits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <Package className="mx-auto mb-6 h-12 w-12 text-editorial-muted/20" />
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-muted">Nenhum item filtrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
