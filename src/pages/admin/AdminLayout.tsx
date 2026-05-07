import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Package, ExternalLink, Menu, X, Key, Cpu, Activity, FileJson } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex min-h-screen bg-editorial-bg-admin font-sans text-editorial-ink">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-6 left-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-editorial-ink text-white shadow-lg md:hidden"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-editorial-border bg-editorial-bg-admin transition-transform duration-300 md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col px-8 py-12">
          <div className="mb-16 flex flex-col gap-1">
            <h1 className="text-[12px] font-bold uppercase tracking-[2px] text-editorial-ink">Gestão do Sistema</h1>
            <span className="text-[10px] font-medium uppercase tracking-[1px] text-editorial-accent">Admin Console</span>
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
                      ? "border border-editorial-ink bg-white text-editorial-ink" 
                      : "text-editorial-muted hover:text-editorial-ink"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-editorial-border">
            <Link 
              to="/" 
              target="_blank"
              className="flex items-center justify-between bg-editorial-ink px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] text-white transition-opacity hover:opacity-90"
            >
              <span>Ver Site Público</span>
              <ExternalLink size={14} />
            </Link>
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
