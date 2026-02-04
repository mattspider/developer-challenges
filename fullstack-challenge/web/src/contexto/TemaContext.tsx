'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ModoTema = 'light' | 'dark';

interface TemaContextType {
  modo: ModoTema;
  alternarTema: () => void;
}

const TemaContext = createContext<TemaContextType | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [modo, setModo] = useState<ModoTema>('light');
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem('tema') as ModoTema | null;
    if (salvo === 'dark' || salvo === 'light') {
      setModo(salvo);
    }
    setInicializado(true);
  }, []);

  useEffect(() => {
    if (inicializado) {
      localStorage.setItem('tema', modo);
    }
  }, [modo, inicializado]);

  const alternarTema = useCallback(() => {
    setModo((atual) => (atual === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <TemaContext.Provider value={{ modo, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return ctx;
}
