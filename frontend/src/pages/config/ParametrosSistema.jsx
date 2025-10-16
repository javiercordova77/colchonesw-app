import { Container, Stack, Typography, Card, CardContent } from '@mui/material';
import NavBack from '../../components/NavBack';

export default function ParametrosSistema() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <NavBack ariaLabel="Volver a Configuración General" />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Parámetros de Sistema</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Preferencias, alertas y límites.
        </Typography>
      </Stack>
      <Card>
        <CardContent>
          {/* ...contenido a definir... */}
        </CardContent>
      </Card>
    </Container>
  );
}