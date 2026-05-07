import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { KitItem } from '../types';

export function useKits(onlyAvailable = true) {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'kits_e_itens'), 
      orderBy('destaque', 'desc'),
      orderBy('updated_at', 'desc')
    );
    
    if (onlyAvailable) {
      q = query(
        collection(db, 'kits_e_itens'), 
        where('publicado', '==', true), 
        orderBy('destaque', 'desc'),
        orderBy('updated_at', 'desc')
      );
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KitItem));
        setKits(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'kits_e_itens');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [onlyAvailable]);

  return { kits, loading };
}
