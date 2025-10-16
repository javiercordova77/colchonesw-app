import { createTheme } from '@mui/material/styles';

// Elimina estas líneas si existen:
// import '@fontsource/poppins/400.css';
// import '@fontsource/poppins/500.css';
// import '@fontsource/poppins/600.css';
// import '@fontsource/poppins/700.css';

export const theme = createTheme({
  typography: {
    // System font stack
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, ' +
                '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"tnum","kern"',
          backgroundColor: '#f6f8f7',
          margin: 0
        }
      }
    }
  }
});