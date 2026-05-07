import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteConfig } from '../types';

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching site config:', error);
      } else if (data) {
        setConfig(data as SiteConfig);
      }
      setLoading(false);
    }

    fetchConfig();

    const channel = supabase
      .channel('site-config-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config', filter: 'id=eq.1' },
        () => fetchConfig()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { config, loading };
}

