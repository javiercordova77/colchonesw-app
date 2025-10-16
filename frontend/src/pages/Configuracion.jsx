import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

export default function Configuracion() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const items = [
    {
      key: 'general',
      title: 'Configuración General',
      desc: 'Ubicaciones, categorías, proveedores y parámetros.',
      icon: <SettingsRoundedIcon />,
      to: '/config/general'
    },
    {
      key: 'control',
      title: 'Control de Inventario',
      desc: 'Ingresos, transferencias y salidas.',
      icon: <Inventory2RoundedIcon />,
      to: '/control-inventario'
    },
    {
      key: 'reportes',
      title: 'Reportes y Consultas',
      desc: 'Stock por ubicación y detalle de variantes.',
      icon: <AssessmentRoundedIcon />,
      to: '/reportes'
    }
  ];

  const measureScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    measureScroll();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => measureScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => measureScroll();
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const scrollByAmount = (dir = 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const dx = Math.round(el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  return (
    <Box sx={{ background: '#f3f5f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        
        {/* Carrusel de opciones */}
        <Box sx={{ position: 'relative' }}>
          {/* Botón Izquierda */}
          <IconButton
            aria-label="Anterior"
            onClick={() => scrollByAmount(-1)}
            disabled={!canLeft}
            sx={{
              position: 'absolute',
              top: '50%',
              left: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:disabled': { opacity: 0.4 },
              zIndex: 2
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          {/* Gradientes laterales */}
          {canLeft && (
            <Box
              sx={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: 24, pointerEvents: 'none',
                background: 'linear-gradient(90deg, rgba(243,245,247,1) 0%, rgba(243,245,247,0) 100%)',
                zIndex: 1
              }}
            />
          )}
          {canRight && (
            <Box
              sx={{
                position: 'absolute',
                right: 0, top: 0, bottom: 0,
                width: 24, pointerEvents: 'none',
                background: 'linear-gradient(270deg, rgba(243,245,247,1) 0%, rgba(243,245,247,0) 100%)',
                zIndex: 1
              }}
            />
          )}

          {/* Contenedor deslizante */}
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              px: 1,
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {items.map((item) => (
              <Card
                key={item.key}
                elevation={3}
                sx={{
                  scrollSnapAlign: 'start',
                  flex: '0 0 260px',          // ancho de la tarjeta
                  aspectRatio: '1 / 1',       // casi cuadrado
                  borderRadius: 3,
                  display: 'flex',
                  transition: 'transform 140ms ease, box-shadow 140ms ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                  '&:focus-within': { outline: '2px solid #285c4a22' }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(item.to)}
                  aria-label={item.title}
                  sx={{ p: 2.25, height: '100%' }}
                >
                  <Stack
                    direction="column"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2.5,
                        bgcolor: 'success.main',          // fondo verde
                        color: 'common.white',            // icono blanco
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& svg': { fontSize: 34 }
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
                      {item.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                        px: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Stack>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          {/* Botón Derecha */}
          <IconButton
            aria-label="Siguiente"
            onClick={() => scrollByAmount(1)}
            disabled={!canRight}
            sx={{
              position: 'absolute',
              top: '50%',
              right: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:disabled': { opacity: 0.4 },
              zIndex: 2
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>

        {/* Área inferior reservada para más información */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ minHeight: 140 }}>
          {/* Espacio para información contextual, widgets, tips o resumen del sistema */}
        </Box>
      </Container>
    </Box>
  );
}