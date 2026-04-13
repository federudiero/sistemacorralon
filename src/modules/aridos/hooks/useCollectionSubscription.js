import { useEffect, useState } from 'react';

export default function useCollectionSubscription(subscribeFn, deps = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const unsubscribe = subscribeFn(
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Error de suscripción');
        setLoading(false);
      },
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, deps);

  return { items, loading, error };
}
