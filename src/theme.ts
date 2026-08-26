import { createTheme } from '@mui/material/styles'

// Warm cocoa + raspberry, kept quiet — this is a working admin tool,
// not a marketing page, so the palette signals "bakery" without shouting.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4A2C2A', light: '#6B4442', dark: '#331D1C' },
    secondary: { main: '#C1447E' },
    background: { default: '#FAF7F3', paper: '#FFFFFF' },
    text: { primary: '#2B211F', secondary: '#6B5D59' },
    divider: '#E7DFD8',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 500 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 500 },
    h6: { fontFamily: '"Fraunces", serif', fontWeight: 500 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#4A2C2A' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#6B5D59' },
      },
    },
  },
})
