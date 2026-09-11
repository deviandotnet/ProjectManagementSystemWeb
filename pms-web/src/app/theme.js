import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#087f78', contrastText: '#f4fffd' },
        error: { main: '#b42318' },
        background: { default: '#eef4f3', paper: '#fbfdfc' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#63d6cd', contrastText: '#062c2a' },
        error: { main: '#ff8a80' },
        background: { default: '#071817', paper: '#0d2422' },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '"Segoe UI Variable", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    button: { fontWeight: 700, textTransform: 'none' },
  },
})
