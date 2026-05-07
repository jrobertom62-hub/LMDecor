import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Search, Calendar, ChevronRight, Clock, Database, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AiLog {
  id: string;
  query: string;
  timestamp: string;
  provider: string;
  model: string;
  filters: any;
  result_count: number;
  status: string;
  duration_ms: number;
}

export function AdminAiLogs() {
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AiLog | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('ai_search_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (data) setLogs(data as AiLog[]);
      setLoading(false);
    }

    fetchLogs();

    const channel = supabase
      .channel('ai-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_search_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-3xl font-serif text-editorial-ink">Logs de Busca IA</h2>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Auditoria e Métricas em Tempo Real</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Logs List */}
        <div className="space-y-4">
          <div className="rounded-sm border border-editorial-border bg-white divide-y divide-editorial-border max-h-[70vh] overflow-y-auto custom-scrollbar">
            {logs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={cn(
                  "w-full text-left p-6 transition-all border-l-4",
                  selectedLog?.id === log.id 
                    ? "border-editorial-accent bg-neutral-50" 
                    : "border-transparent hover:bg-neutral-50 hover:border-editorial-border"
                )}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-sm font-medium text-editorial-ink truncate">"{log.query}"</p>
                    <div className="flex items-center gap-3 text-[10px] text-editorial-muted uppercase font-bold tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-'}</span>
                      <span className="flex items-center gap-1"><Database size={12} /> {log.result_count} resultados</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-editorial-muted">{log.duration_ms}ms</div>
                </div>
              </button>
            ))}
            {loading && (
              <div className="p-12 text-center text-editorial-muted text-xs italic">Carregando logs...</div>
            )}
            {!loading && logs.length === 0 && (
              <div className="p-24 text-center space-y-4">
                <Activity className="mx-auto text-editorial-border" size={48} />
                <p className="text-xs font-bold uppercase tracking-widest text-editorial-muted">Nenhum log encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Log Viewer */}
        <div className="sticky top-12">
          {selectedLog ? (
            <motion.div 
              key={selectedLog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-editorial-border p-10 space-y-10"
            >
              <header className="space-y-2 border-b border-editorial-border pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Detalhes da Requisição</h3>
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider",
                    selectedLog.status === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  )}>
                    {selectedLog.status}
                  </span>
                </div>
                <p className="text-2xl font-serif text-editorial-ink">"{selectedLog.query}"</p>
              </header>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Provedor/Modelo</p>
                  <p className="text-sm font-medium text-editorial-ink">{selectedLog.provider} / {selectedLog.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Tempo de Resposta</p>
                  <p className="text-sm font-medium text-editorial-ink">{selectedLog.duration_ms}ms</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-editorial-muted">
                  <Tag size={14} />
                  <h4 className="text-[10px] font-bold uppercase tracking-[2px]">Filtros Interpretados</h4>
                </div>
                <div className="bg-editorial-bg-admin p-6 border border-editorial-border overflow-x-auto">
                  <pre className="text-[11px] font-mono leading-relaxed text-editorial-ink">
                    {JSON.stringify(selectedLog.filters, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-6 border-t border-editorial-border">
                <div className="flex items-center justify-between text-editorial-muted">
                  <span className="text-[10px] font-bold uppercase tracking-[1px]">ID do Log</span>
                  <span className="text-[10px] font-mono">{selectedLog.id}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center border border-dashed border-editorial-border text-editorial-muted p-12 text-center space-y-4">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-[10px] font-bold uppercase tracking-[2px]">Selecione um log para ver os detalhes da interpretação da IA.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
