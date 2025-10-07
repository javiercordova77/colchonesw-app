import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function NavbarTop({
  title = 'COLCHONES WILSON',
  subtitle = 'Propietario'
}) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'var(--navbar-top-bg, #EAF4F0)',
        color: 'var(--navbar-top-fg, #246440)',
        pt: 'env(safe-area-inset-top)',
        borderBottom: '1px solid rgba(36,100,64,0.15)'
      }}
    >
      <Toolbar variant="regular" sx={{ minHeight: 56, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircleIcon sx={{ fontSize: 32, color: 'inherit' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, letterSpacing: 0.3, lineHeight: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, lineHeight: 1, mt: '2px', letterSpacing: 0.2 }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }} />
      </Toolbar>
    </AppBar>
  );
}