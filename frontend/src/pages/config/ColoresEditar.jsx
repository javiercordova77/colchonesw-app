import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Paper, Button, Snackbar, Alert, useTheme } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavBack from '../../components/NavBack';
import RightInputUncontrolled from '../../components/RightInputUncontrolled';
import { saveColorDraft } from '../../utils/drafts';

export default function ColoresEditar() {
  const { id, idVariante, idColor } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const colorInit = location.state?.color || {};
  const index = location.state?.index ?? null;

  const pageBg = '#f2f2f7';
  const cellRadius = 2;
  const cellShadow = '0 1px 2px rgba(0,0,0,0.06)';
  const labelColor = '#000';
  const valueColor = theme.palette.grey[700];

  const CellRow = ({ label, children, first = false }) => (
    <Box
      onMouseDownCapture={(e) => { const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) e.stopPropagation(); }}
      onTouchStartCapture={(e) => { const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) e.stopPropagation(); }}
      sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25, borderTop: first ? 'none' : '1px solid', borderColor: 'divider' }}
    >
      <Typography sx={{ flex: '0 0 180px', color: labelColor, fontWeight: 400 }}>{label}</Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>{children}</Box>
    </Box>
  );

  // Estados locales (se aplican al salir con Aplicar en forma de draft)
  const [nombre, setNombre] = useState(colorInit.color || colorInit.nombre || '');
  const [codigoHex, setCodigoHex] = useState(colorInit.codigo_color || colorInit.codigo || '');

  const titulo = useMemo(() => nombre || 'Color', [nombre]);

  const onAplicar = () => {
    const payload = {
      index,
      id: colorInit.id ?? null,
      nombre,
      color: nombre,
      codigo: codigoHex,
      codigo_color: codigoHex,
      activo: colorInit.activo ?? true
    };
    saveColorDraft(id, payload);
    navigate(-1); // vuelve a VariantesEditar; allí se consumirá el draft
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: pageBg }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: pageBg, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, position: 'relative', gap: 1 }}>
          <NavBack />
          <Typography variant="subtitle1" sx={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', fontWeight: 600 }}>
            {titulo}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button onClick={onAplicar} variant="text">Aplicar</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
          Datos del color
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          <CellRow label="Nombre" first>
            <RightInputUncontrolled
              defaultValue={nombre}
              onCommit={(v) => setNombre(v)}
              placeholder="Ej. Azul Marino"
              inputMode="text"
            />
          </CellRow>
          <CellRow label="Código (HEX)">
            <RightInputUncontrolled
              defaultValue={codigoHex}
              onCommit={(v) => setCodigoHex(v)}
              placeholder="#003366"
              inputMode="text"
            />
          </CellRow>
        </Paper>
      </Container>
    </Box>
  );
}