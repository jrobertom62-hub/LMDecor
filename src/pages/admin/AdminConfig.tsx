import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SiteConfig } from '../../types';
import { Save, Check, Shield, FileText, Globe, User, Phone, MapPin, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<Partial<SiteConfig>>({
    nome_empresa: '',
    logo_url: '',
    favicon_url: '',
    endereco_texto: '',
    whatsapp: '',
    email: '',
    google_maps_url: '',
    politica_privacidade: '',
    termos_uso: '',
    politica_cookies: '',
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        
        if (data) {
          setFormData(data as SiteConfig);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({
          id: 1,
          ...formData,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };


  const handleChange = (field: keyof SiteConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif text-celebration-ink">Configurações</h2>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-celebration-muted mt-2">Identidade e Dados Institucionais</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-celebration-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Processando...' : saved ? <><Check size={16} /> Salvo</> : <><Save size={16} /> Salvar Alterações</>}
        </button>
      </header>

      <form onSubmit={handleSave} className="grid gap-16">
        {/* Identidade */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-celebration-border pb-4">
            <Globe className="text-celebration-pink" size={16} />
            <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-celebration-ink">Identidade da Empresa</h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-muted">Nome da Empresa</label>
              <input 
                type="text" 
                value={formData.nome_empresa}
                onChange={(e) => handleChange('nome_empresa', e.target.value)}
                className="border border-celebration-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-celebration-pink"
                placeholder="Ex: LM Decor"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-muted">Logo (URL)</label>
              <input 
                type="text" 
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                className="border border-celebration-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-celebration-pink"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-celebration-border pb-4">
            <Phone className="text-celebration-pink" size={16} />
            <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-celebration-ink">Contato e Endereço</h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-muted">Endereço Completo</label>
              <textarea 
                rows={3}
                value={formData.endereco_texto}
                onChange={(e) => handleChange('endereco_texto', e.target.value)}
                className="border border-celebration-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-celebration-pink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-muted">WhatsApp</label>
              <input 
                type="text" 
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="border border-celebration-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-celebration-pink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-celebration-muted">E-mail</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="border border-celebration-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-celebration-pink"
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
