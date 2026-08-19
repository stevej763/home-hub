import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F2ECDD',
      paper: '#F2ECDD',
    },
    text: {
      primary: '#201C14',
      secondary: '#4A4536',
    },
    primary: {
      main: '#B8863A',
      dark: '#8C6425',
      contrastText: '#15191C',
    },
    secondary: {
      main: '#2F6E68',
      contrastText: '#F2ECDD',
    },
    error: {
      main: '#B8503A',
    },
    divider: 'rgba(32,28,20,0.16)',
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"IBM Plex Serif", serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: 'rgba(10,12,13,0.72)',
          backdropFilter: 'blur(2px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          letterSpacing: '0.02em',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Mono", monospace',
          '& fieldset': { borderColor: 'rgba(32,28,20,0.3)' },
          '&:hover fieldset': { borderColor: '#B8863A' },
          '&.Mui-focused fieldset': { borderColor: '#B8863A' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Serif", serif',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(32,28,20,0.05)',
          '&:hover': { backgroundColor: 'rgba(32,28,20,0.08)' },
        },
      },
    },
  },
});

export default theme;
