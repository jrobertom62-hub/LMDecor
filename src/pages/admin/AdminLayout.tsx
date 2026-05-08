import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Package, ExternalLink, Menu, X, Key, Cpu, Activity, FileJson, LogOut } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/admin' },
    { label: 'Catálogo', icon: Package, path: '/admin/items' },
    { label: 'Chaves de API', icon: Key, path: '/admin/api-keys' },
    { label: 'Configuração IA', icon: Cpu, path: '/admin/ai-config' },
    { label: 'Logs de Busca', icon: Activity, path: '/admin/ai-logs' },
    { label: 'Docs API', icon: FileJson, path: '/admin/api-docs' },
    { label: 'Configurações', icon: Settings, path: '/admin/config' },
  ];

  return (
    <div className="flex min-h-screen bg-editorial-bg-admin font-sans text-celebration-ink">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-6 left-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-celebration-ink text-white shadow-lg md:hidden"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-celebration-border bg-celebration-cream transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col px-8 py-12">
          <div className="mb-16 flex flex-col gap-1">
            <h1 className="text-[12px] font-bold uppercase tracking-[2px] text-celebration-ink">Gestão do Sistema</h1>
            <span className="text-[10px] font-medium uppercase tracking-[1px] text-celebration-pink">Admin Console</span>
          </div>

          <nav className="flex-grow space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] transition-all",
                    isActive 
                      ? "border border-celebration-ink bg-white text-celebration-ink" 
                      : "text-celebration-muted hover:text-celebration-ink"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 space-y-4 pt-8 border-t border-celebration-border">
            <Link 
              to="/" 
              target="_blank"
              className="flex items-center justify-between border border-celebration-ink px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-celebration-ink transition-all hover:bg-celebration-ink hover:text-white"
            >
              <span>Ver Site Público</span>
              <ExternalLink size={14} />
            </Link>

            <button 
              onClick={handleLogout}
              className="flex w-full items-center justify-between bg-celebration-ink px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-white transition-opacity hover:opacity-90"
            >
              <span>Sair do Sistema</span>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
