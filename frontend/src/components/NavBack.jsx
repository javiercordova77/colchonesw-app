import { IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';

export default function NavBack({ to = -1, ariaLabel = 'Regresar' }) {
  const navigate = useNavigate();
  return (
    <IconButton
      aria-label={ariaLabel}
      onClick={() => navigate(to)}
      sx={{
        width: 40, height: 40,
        borderRadius: '50%',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 1,
        '&:hover': { boxShadow: 2 }
      }}
    >
      <ArrowBackRoundedIcon />
    </IconButton>
  );
}