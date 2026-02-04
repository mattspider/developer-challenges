'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { fazerLogout } from '../store/authSlice';
import { RootState } from '../store';
import { useTema } from '../contexto/TemaContext';
import { useState } from 'react';

const larguraDrawer = 260;

export function LayoutPrincipal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const usuario = useSelector((s: RootState) => s.auth.usuario);
  const { modo, alternarTema } = useTema();
  const [aberto, setAberto] = useState(false);
  const [sidebarAberto, setSidebarAberto] = useState(true);

  const itens = [
    { texto: 'Maquinas', rota: '/maquinas', icone: <PrecisionManufacturingIcon /> },
    { texto: 'Pontos de Monitoramento', rota: '/pontos-monitoramento', icone: <ShowChartIcon /> },
  ];

  const handleLogout = () => {
    dispatch(fazerLogout());
    router.push('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 600) {
                setAberto(!aberto);
              } else {
                setSidebarAberto(!sidebarAberto);
              }
            }}
            sx={{ mr: 1 }}
            title={sidebarAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            <ChevronLeftIcon sx={{ display: { xs: 'none', sm: sidebarAberto ? 'block' : 'none' } }} />
            <MenuIcon sx={{ display: { xs: 'block', sm: sidebarAberto ? 'none' : 'block' } }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            DynaPredict
          </Typography>
          <IconButton color="inherit" onClick={alternarTema} title={modo === 'dark' ? 'Tema claro' : 'Tema escuro'}>
            {modo === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          {usuario && (
            <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
              {usuario.email}
            </Typography>
          )}
          <Button
            color="inherit"
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={aberto}
        onClose={() => setAberto(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: larguraDrawer,
            top: 64,
            bgcolor: 'background.paper',
          },
        }}
      >
        <List sx={{ pt: 2, px: 1 }}>
          {itens.map((item) => (
            <ListItem key={item.rota} disablePadding>
              <ListItemButton
                selected={pathname === item.rota}
                onClick={() => {
                  router.push(item.rota);
                  setAberto(false);
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icone}</ListItemIcon>
                <ListItemText primary={item.texto} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: sidebarAberto ? larguraDrawer : 0,
            top: 64,
            height: 'calc(100% - 64px)',
            bgcolor: 'background.paper',
            borderRight: sidebarAberto ? 1 : 0,
            borderColor: 'divider',
            overflow: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <List sx={{ pt: 3, px: 2 }}>
          {itens.map((item) => (
            <ListItem key={item.rota} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={pathname === item.rota}
                onClick={() => router.push(item.rota)}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: pathname === item.rota ? 'primary.main' : 'inherit' }}>
                  {item.icone}
                </ListItemIcon>
                <ListItemText
                  primary={item.texto}
                  primaryTypographyProps={{ fontWeight: pathname === item.rota ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          ml: { xs: 0, sm: sidebarAberto ? `${larguraDrawer}px` : 0 },
          width: { xs: '100%', sm: sidebarAberto ? `calc(100% - ${larguraDrawer}px)` : '100%' },
          minHeight: 'calc(100vh - 64px)',
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
