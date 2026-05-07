import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LogIn, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-editorial-bg-admin px-4 font-sans text-editorial-ink">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl italic text-editorial-ink">LM Decor</h1>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[3px] text-editorial-muted">Painel Administrativo</p>
        </div>

        <div className="bg-white p-10 border border-editorial-border shadow-sm">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-editorial-muted" size={16} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lmdecor.com.br"
                  className="w-full border border-editorial-border bg-white py-4 pl-12 pr-4 text-sm outline-none transition-all focus:border-editorial-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-editorial-muted" size={16} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-editorial-border bg-white py-4 pl-12 pr-4 text-sm outline-none transition-all focus:border-editorial-accent"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 p-4 text-xs text-red-600 border border-red-100">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-editorial-ink py-5 text-[11px] font-bold uppercase tracking-[2px] text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-editorial-muted uppercase tracking-[1px]">
          Acesso restrito a administradores autorizados.
        </p>
      </motion.div>
    </div>
  );
}
