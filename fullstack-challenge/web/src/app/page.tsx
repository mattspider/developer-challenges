'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Index() {
  const router = useRouter();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    if (token) {
      router.replace('/maquinas');
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  return <div>Carregando...</div>;
}
