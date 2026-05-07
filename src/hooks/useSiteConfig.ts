import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SiteConfig } from '../types';

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config_site', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data() as SiteConfig);
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'config_site/global');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { config, loading };
}
