import { IconButton } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import { useNavigate } from 'react-router-dom';

// Ícono circular estilo iOS (círculo blanco, borde negro, chevron negro fino)
function BackCircleIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      {/* Círculo */}
      <circle cx="16" cy="16" r="14.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="0.6" />
      {/* Chevron "<" */}
      <path
        d="M18.5 10 L12.5 16 L18.5 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export default function NavBack({ to = -1, ariaLabel = 'Regresar' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof to === 'string') {
      // Fuerza animación de regreso (izq → der)
      navigate(to, { state: { slide: 'right' } });
    } else {
      // POP => slide-right según App.jsx
      navigate(-1);
    }
  };

  return (
    <IconButton
      aria-label={ariaLabel}
      onClick={handleBack}
      disableRipple
      sx={{
        // Área táctil amplia, pero sin estilos de botón
        width: 40,
        height: 40,
        p: 0,
        color: 'common.black',
        bgcolor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        '&:hover': { bgcolor: 'transparent' },
      }}
    >
      <BackCircleIcon sx={{ fontSize: 38 }} />
    </IconButton>
  );
}