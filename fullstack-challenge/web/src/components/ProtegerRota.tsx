'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function ProtegerRota({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSelector((s: RootState) => s.auth.token);
  const carregando = useSelector((s: RootState) => s.auth.carregando);

  useEffect(() => {
    if (!carregando && !token) {
      router.push('/login');
    }
  }, [token, carregando, router]);

  if (carregando) {
    return <div>Carregando...</div>;
  }
  if (!token) {
    return null;
  }
  return <>{children}</>;
}
