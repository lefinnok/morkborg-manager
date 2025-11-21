import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, CircularProgress } from '@mui/material';
import LandingPage from './components/landing/LandingPage';
import PlayerApp from './components/player/PlayerApp';
import CharacterCreation from './components/player/CharacterCreation';
import { contentService } from './services';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [contentLoaded, setContentLoaded] = useState(false);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/player" element={<PlayerApp />} />
          <Route path="/player/create" element={<CharacterCreation />} />
          <Route path="/player/sheet/:id" element={<div>Character Sheet Coming Soon</div>} />
          <Route path="/player/import" element={<div>Import Character Coming Soon</div>} />
          <Route path="/dm" element={<div>DM App Coming Soon</div>} />
          <Route path="/dm/session/new" element={<div>New Session Coming Soon</div>} />
          <Route path="/dm/session/:id/combat" element={<div>Combat Tab Coming Soon</div>} />
          <Route path="/dm/session/:id/overview" element={<div>Overview Tab Coming Soon</div>} />
          <Route path="/dm/session/:id/reference" element={<div>Reference Tab Coming Soon</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
