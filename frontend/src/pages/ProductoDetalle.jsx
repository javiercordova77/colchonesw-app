import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductoPorCodigo, BASE_URL } from '../api';
import { Box, Typography, Paper, CircularProgress, Grid, Chip } from '@mui/material';

export default function ProductDetail() {
  const { codigo } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchProductoPorCodigo(codigo)
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo obtener el producto');
        setLoading(false);
      });
  }, [codigo]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ mt: 6, textAlign: 'center' }}>{error}</Typography>;
  if (!producto) return null;

  const imgSrc = producto.imagen ? `${BASE_URL}/images/${producto.imagen}` : '/logo.jpg';

  return (
    <Box className="container">
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <img src={imgSrc} alt={producto.descripcion} style={{ width: '100%', borderRadius: 8 }} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography variant="h6">{producto.descripcion}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{producto.categoria}</Typography>
            <Typography sx={{ mt: 1 }}><strong>Medida:</strong> {producto.medida}</Typography>
            <Typography><strong>Material:</strong> {producto.material}</Typography>
            <Typography sx={{ mt: 1 }}><strong>Precio venta:</strong> {producto.precio_venta}</Typography>
            <Typography><strong>Precio compra:</strong> {producto.precio_compra}</Typography>
            <Typography><strong>Cantidad disponible:</strong> {producto.cantidad_disponible}</Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Colores</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {producto.colores && producto.colores.length ? producto.colores.map((c, idx) => (
                  <Chip
                    key={idx}
                    label={c.color}
                    sx={{
                      backgroundColor: c.codigo_color || undefined,
                      color: (c.codigo_color && (c.codigo_color.toLowerCase() === '#000000' ? '#ffffff' : '#000')) || undefined
                    }}
                  />
                )) : <Typography color="text.secondary">Sin colores</Typography>}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Proveedor</Typography>
              <Typography>{producto.proveedor?.nombre}</Typography>
              <Typography variant="caption">{producto.proveedor?.actividad}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}