import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  created_at: any;
  last_used: any;
}

export function AdminApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'api_keys'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setKeys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiKey)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const generateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const key = `pk_${uuidv4().replace(/-/g, '')}`;
    try {
      await addDoc(collection(db, 'api_keys'), {
        key,
        name: newKeyName,
        active: true,
        created_at: serverTimestamp(),
        last_used: null
      });
      setNewKeyGenerated(key);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'api_keys');
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'api_keys', id), {
        active: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `api_keys/${id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif text-editorial-ink">Chaves de API</h2>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted mt-2">Gerenciamento de Acesso Privado</p>
        </div>
        
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setNewKeyGenerated(null);
            setNewKeyName('');
          }}
          className="flex items-center gap-2 bg-editorial-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90"
        >
          <Plus size={16} /> Gerar Nova Chave
        </button>
      </header>

      <div className="rounded-sm border border-editorial-border bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-editorial-border bg-editorial-bg-admin">
              <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Identificador/Nome</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Chave</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Status</th>
              <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Criado em</th>
              <th className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-[2px] text-editorial-muted">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-editorial-border">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-editorial-bg-admin/50 transition-colors">
                <td className="px-10 py-6 font-medium text-editorial-ink">{key.name}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-editorial-muted">
                      {showKeyId === key.id ? key.key : `${key.key.slice(0, 8)}****************`}
                    </span>
                    <button 
                      onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                      className="text-editorial-muted hover:text-editorial-ink"
                    >
                      {showKeyId === key.id ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(key.key)}
                      className="text-editorial-muted hover:text-editorial-accent"
                    >
                      {copiedKey === key.key ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={cn(
                    "inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-[1px]",
                    key.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  )}>
                    {key.active ? 'Ativa' : 'Revogada'}
                  </span>
                </td>
                <td className="px-6 py-6 text-[11px] text-editorial-muted">
                  {key.created_at ? new Date(key.created_at.seconds * 1000).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => toggleKeyStatus(key.id, key.active)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[1px] transition-colors",
                      key.active ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"
                    )}
                  >
                    {key.active ? 'Revogar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && keys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-10 py-24 text-center">
                  <Key className="mx-auto mb-4 h-12 w-12 text-editorial-muted/20" />
                  <p className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-muted">Nenhuma chave de API gerada.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-editorial-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white p-12 shadow-2xl"
            >
              <h3 className="font-serif text-2xl text-editorial-ink">Gerar Chave de API</h3>
              {newKeyGenerated ? (
                <div className="mt-8 space-y-6">
                  <p className="text-sm text-editorial-muted">
                    Sua chave foi gerada com sucesso. **Copie-a agora**, pois ela não poderá ser visualizada novamente por completo.
                  </p>
                  <div className="flex items-center gap-3 bg-neutral-50 p-4 border border-editorial-border font-mono text-sm break-all">
                    {newKeyGenerated}
                    <button 
                      onClick={() => copyToClipboard(newKeyGenerated)}
                      className="shrink-0 text-editorial-accent"
                    >
                      {copiedKey === newKeyGenerated ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-editorial-ink py-4 text-[11px] font-bold uppercase tracking-[2px] text-white"
                  >
                    Entendi, já salvei a chave
                  </button>
                </div>
              ) : (
                <form onSubmit={generateNewKey} className="mt-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Nome da Chave (ex: N8N Pipeline)</label>
                    <input 
                      required
                      type="text" 
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full border border-editorial-border p-4 text-sm outline-none focus:border-editorial-accent"
                      placeholder="Identifique onde essa chave será usada"
                    />
                  </div>
                  <div className="flex justify-end gap-6">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-[11px] font-bold uppercase tracking-[2px] text-editorial-muted"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="bg-editorial-ink px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-white"
                    >
                      Gerar Agora
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
