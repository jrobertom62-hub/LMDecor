import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Cpu, Save, ShieldCheck, AlertTriangle, Settings, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AiConfig {
  provider: 'gemini' | 'openai';
  model: string;
  api_key: string;
  default_mode: 'enxuto' | 'detalhado';
}

export function AdminAiConfig() {
  const [config, setConfig] = useState<AiConfig>({
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    api_key: '',
    default_mode: 'enxuto'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('ai_config')
          .select('*')
          .eq('id', 'global')
          .single();
        
        if (data) {
          setConfig(data as AiConfig);
        }
      } catch (error) {
        console.error('Error fetching AI config:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const { error } = await supabase
        .from('ai_config')
        .upsert({
          id: 'global',
          ...config,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Erro ao salvar configuração de IA.');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return null;

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-3xl font-serif text-editorial-ink">Configuração de IA</h2>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Personalização da Busca Inteligente</p>
      </header>

      <form onSubmit={handleSave} className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Provider Selection */}
          <section className="bg-white border border-editorial-border p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <Cpu className="text-editorial-accent" size={20} />
              <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Provedor e Modelo</h3>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Provedor Ativo</label>
                <select 
                  value={config.provider}
                  onChange={(e) => setConfig({...config, provider: e.target.value as any, model: e.target.value === 'gemini' ? 'gemini-3.1-pro-preview' : 'gpt-4o'})}
                  className="w-full border border-editorial-border p-4 text-sm outline-none focus:border-editorial-accent bg-white"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Modelo Específico</label>
                <input 
                  type="text" 
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                  className="w-full border border-editorial-border p-4 text-sm outline-none focus:border-editorial-accent"
                  placeholder={config.provider === 'gemini' ? 'gemini-3.1-pro-preview' : 'gpt-4o'}
                />
                <p className="text-[9px] text-editorial-muted italic">
                  Sugestão Gemini: gemini-3.1-pro-preview
                </p>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Chave de API do Provedor</label>
                <div className="relative">
                   <input 
                    type="password" 
                    value={config.api_key}
                    onChange={(e) => setConfig({...config, api_key: e.target.value})}
                    className="w-full border border-editorial-border p-4 text-sm outline-none focus:border-editorial-accent font-mono"
                    placeholder="sk-..."
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-editorial-muted">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <p className="text-[10px] text-editorial-muted leading-relaxed">
                  Esta chave será usada para as chamadas de busca no endpoint <code className="bg-editorial-bg-admin px-1">/v1/busca-ia</code>.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-editorial-border p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <Settings className="text-editorial-accent" size={20} />
              <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Preferências de Resposta</h3>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Modo de Resposta Padrão</label>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    checked={config.default_mode === 'enxuto'}
                    onChange={() => setConfig({...config, default_mode: 'enxuto'})}
                    className="h-4 w-4 accent-editorial-ink"
                  />
                  <span className="text-sm text-editorial-ink group-hover:text-editorial-accent transition-colors">Enxuto (ID, Título, Preço)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    checked={config.default_mode === 'detalhado'}
                    onChange={() => setConfig({...config, default_mode: 'detalhado'})}
                    className="h-4 w-4 accent-editorial-ink"
                  />
                  <span className="text-sm text-editorial-ink group-hover:text-editorial-accent transition-colors">Detalhado (Conteúdo completo)</span>
                </label>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between bg-editorial-bg-admin p-8 border border-editorial-border rounded-sm">
            <div className="flex items-center gap-4 text-editorial-ink">
              {success ? (
                <span className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[1px]">
                  <Check size={16} /> Configurações Salvas
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted italic">As alterações refletem no endpoint de busca instantaneamente.</span>
              )}
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 bg-editorial-ink px-12 py-5 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÃO'}
            </button>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-amber-50 border border-amber-200 p-8 space-y-4">
             <div className="flex items-center gap-2 text-amber-800">
               <AlertTriangle size={18} />
               <h4 className="text-[11px] font-bold uppercase tracking-[1px]">Aviso de Segurança</h4>
             </div>
             <p className="text-[11px] text-amber-900/70 leading-relaxed">
               As chaves de API da OpenAI/Gemini são armazenadas no banco de dados. Certifique-se de configurar as permissões de acesso corretamente ou rotacionar as chaves periodicamente.
             </p>
          </div>

          <div className="bg-white border border-editorial-border p-8 space-y-4">
             <h4 className="text-[11px] font-bold uppercase tracking-[1px] text-editorial-ink">Dica de Busca IA</h4>
             <p className="text-[11px] text-editorial-muted leading-relaxed">
               A IA será instruída a extrair cores, temas e preços. Quanto melhor o modelo (ex: Gemini 3.1 Pro), mais precisa será a interpretação das frases complexas dos seus clientes.
             </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
