import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import { fetchProductosListado, BASE_URL } from '../api';

export default function Inventario() {
  console.log('[TRACE] Inventario: render inicial');
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');
  const [orden, setOrden] = useState('nombre_asc');
  const [menuAnchor, setMenuAnchor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        console.log('[TRACE] Inventario: fetchListado...');
        const data = await fetchProductosListado();
        if (cancel) return;
        console.log('[TRACE] Inventario: fetch OK, items=', Array.isArray(data) ? data.length : 0);
        setProductos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('[ERROR] Inventario: fetchListado fallo:', e);
        setProductos([]);
      } finally {
        !cancel && setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, []);

  const productosFiltrados = useMemo(() => {
    let arr = [...productos];
    const query = q.trim().toLowerCase();
    if (query) {
      arr = arr.filter(p =>
        (p.descripcion || '').toLowerCase().includes(query) ||
        (p.codigo_variante || '').toLowerCase().includes(query) ||
        (p.medida || '').toLowerCase().includes(query) ||
        String(p.cantidad_disponible ?? '').includes(query)
      );
    }
    switch (orden) {
      case 'nombre_asc':
        arr.sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''));
        break;
      case 'nombre_desc':
        arr.sort((a, b) => (b.descripcion || '').localeCompare(a.descripcion || ''));
        break;
      case 'stock_desc':
        arr.sort((a, b) => (b.cantidad_disponible || 0) - (a.cantidad_disponible || 0));
        break;
      case 'stock_asc':
        arr.sort((a, b) => (a.cantidad_disponible || 0) - (b.cantidad_disponible || 0));
        break;
      default:
        break;
    }
    return arr;
  }, [productos, q, orden]);

  const reset = () => {
    setQ('');
    setOrden('nombre_asc');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f4f5f6' }}>
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 1.5, sm: 2.5 }, pb: 8 }}>
        {/* Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 42,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 42 },
              '& .MuiTabs-indicator': { height: 3, borderRadius: 3, background: '#285c4a' }
            }}
          >
            <Tab label={`Items (${productosFiltrados.length})`} />
            <Tab label="(Próximo)" disabled />
          </Tabs>
          <Box>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="ordenar">
              <SortIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={reset} aria-label="reiniciar">
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Búsqueda */}
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          placeholder="Buscar por nombre, código, medida o stock..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 1.5, '& .MuiInputBase-root': { borderRadius: 3, background: '#fff' } }}
        />

        <Divider sx={{ mb: 1.5 }} />

        {/* Lista */}
        <Box
          sx={{
            borderRadius: 2,
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            minHeight: 220
          }}
        >
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={32} />
            </Box>
          ) : productosFiltrados.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No hay resultados.</Typography>
            </Box>
          ) : (
            <Box>
              {productosFiltrados.map(p => {
                const img = p.imagen ? `${BASE_URL}/images/${p.imagen}` : '/logo.png';
                return (
                  <Box
                    key={p.id_variante || p.codigo_variante}
                    onClick={() => navigate(`/producto/${encodeURIComponent(p.codigo_variante)}`)}
                    sx={{
                      display: 'flex',
                      gap: 1.4,
                      py: 1.05,
                      px: 1.2,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      alignItems: 'center',
                      '&:hover': { background: 'rgba(0,0,0,0.035)' }
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={p.descripcion}
                      sx={{
                        width: 52,
                        height: 52,
                        objectFit: 'contain',
                        borderRadius: 2,
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
                        {p.descripcion}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, mt: 0.2 }}>
                        {p.medida || '-'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ mt: 0.4, display: 'block', fontWeight: 600 }}
                        color={Number(p.cantidad_disponible) === 0 ? 'error.main' : 'text.primary'}
                      >
                        Stock: {p.cantidad_disponible}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 70 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', opacity: 0.8 }}>
                        {p.categoria || ''}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'success.dark', mt: 0.3, display: 'block' }}
                      >
                        ${Number(p.precio_venta || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Menú ordenar */}
        <Menu
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
        >
          {[
            { v: 'nombre_asc', t: 'Nombre A-Z' },
            { v: 'nombre_desc', t: 'Nombre Z-A' },
            { v: 'stock_desc', t: 'Stock mayor a menor' },
            { v: 'stock_asc', t: 'Stock menor a mayor' }
          ].map(o => (
            <MenuItem
              key={o.v}
              selected={orden === o.v}
              onClick={() => { setOrden(o.v); setMenuAnchor(null); }}
            >
              {o.t}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}