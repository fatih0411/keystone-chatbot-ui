import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chat from './components/Chat';
import { config } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: config.theme.primary,
    },
    background: {
      default: '#F0F2F5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        position: 'relative' // Add this to ensure proper stacking context
      }}>
        <Chat />
      </div>
    </ThemeProvider>
  );
}

export default App;
