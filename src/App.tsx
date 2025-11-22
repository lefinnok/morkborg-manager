import { useEffect, useState, useMemo, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { getSafeStorage } from './utils/storageAvailable';
import LandingPage from './components/landing/LandingPage';
import PlayerApp from './components/player/PlayerApp';
import CharacterCreation from './components/player/CharacterCreation';
import CharacterSheet from './components/player/CharacterSheet';
import ImportCharacter from './components/player/ImportCharacter';
import DMApp from './components/dm/DMApp';
import NewSession from './components/dm/NewSession';
import SessionView from './components/dm/SessionView';
import Settings from './components/shared/Settings';
import { contentService } from './services';

// Mörk Borg color palette
const MORK_BORG_PINK = '#FF3EB5';
const MORK_BORG_YELLOW = '#FFE900';
const RICH_BLACK = '#0A0A0A';

// Theme context for mode switching
export const ThemeModeContext = createContext({
  toggleThemeMode: () => {},
  mode: 'dark' as PaletteMode
});

const getMorkBorgTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Dark mode - true Mörk Borg aesthetic
          primary: {
            main: MORK_BORG_PINK,
            light: '#FF70CC',
            dark: '#CC0088',
            contrastText: '#000000',
          },
          secondary: {
            main: MORK_BORG_YELLOW,
            light: '#FFEF4D',
            dark: '#CCB800',
            contrastText: '#000000',
          },
          background: {
            default: RICH_BLACK,
            paper: '#1A1A1A',
          },
          text: {
            primary: '#F0F0F0',
            secondary: '#CCCCCC',
          },
          error: {
            main: '#FF0000',
            light: '#FF4D4D',
            dark: '#CC0000',
          },
          warning: {
            main: MORK_BORG_YELLOW,
          },
          success: {
            main: '#00FF00',
            light: '#4DFF4D',
            dark: '#00CC00',
          },
          divider: '#333333',
          action: {
            hover: 'rgba(255, 62, 181, 0.1)',
            selected: 'rgba(255, 62, 181, 0.2)',
          },
        }
      : {
          // Light mode - inverted with parchment feel
          primary: {
            main: '#CC0088',
            light: '#FF3EB5',
            dark: '#990066',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#CCB800',
            light: '#FFE900',
            dark: '#998800',
            contrastText: '#000000',
          },
          background: {
            default: '#F5F5DC', // Beige/parchment
            paper: '#FFFFFF',
          },
          text: {
            primary: '#1A1A1A',
            secondary: '#4A4A4A',
          },
          error: {
            main: '#CC0000',
          },
          warning: {
            main: '#CCB800',
          },
          success: {
            main: '#00AA00',
          },
          divider: '#CCCCCC',
        }
    ),
  },
  typography: {
    fontFamily: '"Courier Prime", "Inconsolata", "Courier New", monospace',
    h1: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    h3: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    h4: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    h5: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    h6: {
      fontFamily: '"Metal Mania", "Metamorphous", "Old English Text MT", cursive',
      fontWeight: 400,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    },
    body1: {
      fontFamily: '"Courier Prime", "Inconsolata", "Courier New", monospace',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Courier Prime", "Inconsolata", "Courier New", monospace',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Arial Black", "Impact", sans-serif',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid',
          textTransform: 'uppercase',
          fontWeight: 700,
        },
        contained: {
          boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
          '&:hover': {
            boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.5)',
            transform: 'translate(2px, 2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid',
          borderColor: mode === 'dark' ? MORK_BORG_PINK : '#990066',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '3px solid',
          borderColor: mode === 'dark' ? MORK_BORG_PINK : '#990066',
          boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 700,
          border: '2px solid',
        },
      },
    },
  },
});

function App() {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [mode, setMode] = useState<PaletteMode>(() => {
    // Load theme preference from storage
    const storage = getSafeStorage();
    const saved = storage.getItem('themeMode');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const theme = useMemo(() => getMorkBorgTheme(mode), [mode]);

  const toggleThemeMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'dark' ? 'light' : 'dark';
      const storage = getSafeStorage();
      storage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    contentService.loadContent()
      .then(() => setContentLoaded(true))
      .catch(error => {
        console.error('Failed to load content:', error);
      });
  }, []);

  if (!contentLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeModeContext.Provider value={{ toggleThemeMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/player" element={<PlayerApp />} />
            <Route path="/player/create" element={<CharacterCreation />} />
            <Route path="/player/sheet/:id" element={<CharacterSheet />} />
            <Route path="/player/import" element={<ImportCharacter />} />
            <Route path="/dm" element={<DMApp />} />
            <Route path="/dm/session/new" element={<NewSession />} />
            <Route path="/dm/session/:id/combat" element={<SessionView />} />
            <Route path="/dm/session/:id/overview" element={<SessionView />} />
            <Route path="/dm/session/:id/reference" element={<SessionView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default App;
