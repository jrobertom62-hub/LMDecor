import { useOutletContext } from 'react-router-dom';
import { SiteConfig } from '../../types';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies';
}

export function LegalPage({ type }: LegalPageProps) {
  const { config } = useOutletContext<{ config: SiteConfig }>();

  const contentMap = {
    privacy: {
      title: 'Política de Privacidade',
      text: config?.politica_privacidade,
    },
    terms: {
      title: 'Termos de Uso',
      text: config?.termos_uso,
    },
    cookies: {
      title: 'Política de Cookies',
      text: config?.politica_cookies,
    },
  };

  const current = contentMap[type];

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <header className="space-y-4">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[#1a1a1a]">
            {current.title}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40">
            Última atualização: {config?.updated_at ? new Date(config.updated_at.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
          </p>
        </header>

        <div className="prose prose-stone max-w-none prose-p:text-[#1a1a1a]/70 prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-[#1a1a1a] prose-a:text-[#5A5A40] prose-strong:text-[#1a1a1a]">
          {current.text ? (
            <ReactMarkdown>{current.text}</ReactMarkdown>
          ) : (
            <p className="italic text-[#1a1a1a]/30">Conteúdo ainda não configurado pelo administrador.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
