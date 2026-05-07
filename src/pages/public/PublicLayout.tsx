import { Link, Outlet } from 'react-router-dom';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

export function PublicLayout() {
  const { config, loading } = useSiteConfig();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-editorial-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-editorial-accent border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-editorial-cream font-sans text-editorial-ink">
      <Navbar config={config} />
      <main className="flex-grow">
        <Outlet context={{ config }} />
      </main>
      <Footer config={config} />
      <WhatsAppButton phone={config?.whatsapp} />
    </div>
  );
}
