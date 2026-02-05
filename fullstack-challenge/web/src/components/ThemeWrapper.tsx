'use client';

import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { TemaProvider, useTema } from '../context/TemaContext';

function TemaInterno({ children }: { children: React.ReactNode }) {
  const { modo } = useTema();

  const tema = useMemo(
    () =>
      createTheme({
        palette: {
          mode: modo,
          primary: {
            main: modo === 'dark' ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: modo === 'dark' ? '#ce93d8' : '#9c27b0',
          },
          background: {
            default: modo === 'dark' ? '#0d1117' : '#f5f7fa',
            paper: modo === 'dark' ? '#161b22' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '1.75rem',
            fontWeight: 600,
          },
          h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow:
                  modo === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.3)'
                    : '0 2px 12px rgba(0,0,0,0.08)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: modo === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              },
            },
          },
        },
      }),
    [modo]
  );

  return (
    <ThemeProvider theme={tema}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TemaProvider>
      <TemaInterno>{children}</TemaInterno>
    </TemaProvider>
  );
}
