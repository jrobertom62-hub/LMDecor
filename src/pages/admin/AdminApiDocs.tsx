import { FileJson, Copy, Check, Terminal, ExternalLink, Cpu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function AdminApiDocs() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="flex h-8 w-8 items-center justify-center bg-white border border-editorial-border text-editorial-ink hover:text-editorial-accent"
        >
          {copiedId === id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="bg-editorial-ink p-8 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-16">
      <header>
        <h2 className="text-3xl font-serif text-editorial-ink">Documentação da API</h2>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Guia Técnico e Referência de Endpoints</p>
      </header>

      <div className="grid gap-16 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="sticky top-12 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Navegação</h4>
            <div className="space-y-1">
              {['Autenticação', 'Kits e Itens', 'Busca com IA', 'Exemplos N8N'].map(item => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block py-2 text-sm text-editorial-ink hover:text-editorial-accent transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="lg:col-span-3 space-y-24">
          {/* Autenticação */}
          <section id="autenticação" className="space-y-8">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <Terminal className="text-editorial-accent" size={20} />
              <h3 className="text-2xl font-serif text-editorial-ink">Autenticação</h3>
            </div>
            <p className="text-sm text-editorial-muted leading-relaxed">
              Toda requisição feita aos endpoints privados deve conter o cabeçalho <code className="bg-editorial-bg-admin px-1 font-bold">Authorization</code> com um token do tipo Bearer. Você pode gerar suas chaves na página de <a href="/admin/api-keys" className="text-editorial-accent underline">Chaves de API</a>.
            </p>
            <CodeBlock 
              id="auth"
              code={`curl -X GET "${baseUrl}/v1/kits-e-itens" \\
  -H "Authorization: Bearer SUA_CHAVE_AQUI"`}
            />
          </section>

          {/* Kits e Itens */}
          <section id="kits-e-itens" className="space-y-12">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <FileJson className="text-editorial-accent" size={20} />
              <h3 className="text-2xl font-serif text-editorial-ink">Kits e Itens</h3>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Listar e Filtrar</h4>
              <p className="text-sm text-editorial-muted">Retorna todos os produtos com suporte a paginação e filtros.</p>
              <CodeBlock 
                id="list"
                code={`GET /v1/kits-e-itens?tipo=kit_completo&tema=safari&limit=10`}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-editorial-border">
                  <thead className="bg-editorial-bg-admin">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wide">Parâmetro</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wide">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-border">
                    <tr><td className="px-4 py-3 font-mono">tipo</td><td className="px-4 py-3 italic">kit_completo, item_avulso, etc.</td></tr>
                    <tr><td className="px-4 py-3 font-mono">tema</td><td className="px-4 py-3 italic">filtro por tema</td></tr>
                    <tr><td className="px-4 py-3 font-mono">q</td><td className="px-4 py-3 italic">busca textual</td></tr>
                    <tr><td className="px-4 py-3 font-mono">codigo</td><td className="px-4 py-3 italic">busca por código do produto</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-ink">Buscar por Código</h4>
              <p className="text-sm text-editorial-muted">Ideal para integração com chatbots do WhatsApp.</p>
              <CodeBlock 
                id="code"
                code={`GET /v1/kits-e-itens/codigo/PROD-123`}
              />
            </div>
          </section>

          {/* Busca IA */}
          <section id="busca-com-ia" className="space-y-8">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <Cpu className="text-editorial-accent" size={20} />
              <h3 className="text-2xl font-serif text-editorial-ink">Busca com IA (NLP)</h3>
            </div>
            <p className="text-sm text-editorial-muted leading-relaxed">
              Endpoint que recebe uma frase em linguagem natural e utiliza IA para extrair os filtros e retornar resultados relevantes.
            </p>
            <CodeBlock 
              id="ai-search"
              code={`POST /v1/busca-ia
{
  "query": "Gostaria de ver kits para festa safari até 400 reais",
  "modo": "enxuto"
}`}
            />
          </section>

          {/* N8N Info */}
          <section id="exemplos-n8n" className="space-y-8">
            <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
              <ExternalLink className="text-editorial-accent" size={20} />
              <h3 className="text-2xl font-serif text-editorial-ink">Integração com N8N</h3>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-10 space-y-6">
               <p className="text-sm text-blue-900/80 leading-relaxed">
                 O sistema é 100% compatível com o nó <strong>HTTP Request</strong> do N8N.
               </p>
               <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-blue-900">
                 <li className="flex items-center gap-2">1. Método: GET ou POST</li>
                 <li className="flex items-center gap-2">2. URL: {baseUrl}/v1/...</li>
                 <li className="flex items-center gap-2">3. Auth: Header Auth com Bearer Token</li>
                 <li className="flex items-center gap-2">4. Body: JSON (apenas para /busca-ia)</li>
               </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
