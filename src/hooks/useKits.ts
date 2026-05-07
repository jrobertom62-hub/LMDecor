import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { KitItem } from '../types';

export function useKits(onlyAvailable = true) {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKits() {
      setLoading(true);
      let query = supabase
        .from('kits_e_itens')
        .select('*')
        .order('destaque', { ascending: false })
        .order('updated_at', { ascending: false });

      if (onlyAvailable) {
        query = query.eq('publicado', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching kits:', error);
      } else {
        setKits((data as KitItem[]) || []);
      }
      setLoading(false);
    }

    fetchKits();

    const channel = supabase
      .channel('kits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kits_e_itens' },
        () => fetchKits()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onlyAvailable]);

  return { kits, loading };
}

