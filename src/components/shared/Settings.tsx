import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RefreshIcon from '@mui/icons-material/Refresh';
import { localStorageService } from '../../services';
import ThemeToggle from './ThemeToggle';

export default function Settings() {
  const navigate = useNavigate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState(false);

  const handleClearAllData = async () => {
    // Clear all localStorage data
    localStorage.clear();
    setClearDialogOpen(false);
    setClearSuccess(true);

    // Reload the page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleMigrateCharacters = async () => {
    // Get all characters and update them to have selectedAbilities if missing
    const characters = await localStorageService.getAllCharacters();
    let updatedCount = 0;

    for (const char of characters) {
      let needsUpdate = false;
      const updated = { ...char };

      // Add selectedAbilities if missing
      if (!updated.selectedAbilities) {
        updated.selectedAbilities = [];
        needsUpdate = true;
      }

      // Add ammo if missing
      if (updated.ammo === undefined) {
        updated.ammo = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await localStorageService.updateCharacter(updated);
        updatedCount++;
      }
    }

    setMigrateSuccess(true);
    setTimeout(() => setMigrateSuccess(false), 3000);
  };

  const handleClearCharacters = async () => {
    const characters = await localStorageService.getAllCharacters();
    for (const char of characters) {
      await localStorageService.deleteCharacter(char.id);
    }
    setClearSuccess(true);
    setTimeout(() => {
      setClearSuccess(false);
      navigate('/');
    }, 2000);
  };

  const handleClearSessions = async () => {
    const sessions = await localStorageService.getAllSessions();
    for (const session of sessions) {
      await localStorageService.deleteSession(session.id);
    }
    setClearSuccess(true);
    setTimeout(() => {
      setClearSuccess(false);
      navigate('/');
    }, 2000);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <ThemeToggle />
          </Box>
        </Box>

        {clearSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Data cleared successfully! Redirecting...
          </Alert>
        )}

        {migrateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Characters migrated successfully!
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Theme Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Toggle between dark and light mode using the button in the top right.
            </Typography>
          </Paper>

          {/* Data Migration Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Migration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Update existing characters to support new features (class abilities, ammo tracking, etc.)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleMigrateCharacters}
              fullWidth
            >
              Migrate Characters
            </Button>
          </Paper>

          <Divider />

          {/* Danger Zone */}
          <Paper sx={{ p: 3, borderColor: 'error.main' }}>
            <Typography variant="h6" gutterBottom color="error">
              Danger Zone
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Clear All Characters
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Delete all player characters. This cannot be undone.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleClearCharacters}
                  fullWidth
                >
                  Clear All Characters
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Clear All DM Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Delete all DM sessions and combat data. This cannot be undone.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleClearSessions}
                  fullWidth
                >
                  Clear All Sessions
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Clear All Data
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Reset the application completely. Deletes all characters, sessions, and settings. This cannot be undone.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  fullWidth
                >
                  Clear All Data
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* App Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mörk Borg Manager - Digital companion for Mörk Borg TTRPG
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Data is stored locally in your browser. No data is sent to any server.
            </Typography>
          </Paper>
        </Stack>

        {/* Confirmation Dialog */}
        <Dialog
          open={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
        >
          <DialogTitle>Clear All Data?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently delete all characters, DM sessions, and settings.
              This action cannot be undone. Are you absolutely sure?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearAllData} color="error" variant="contained">
              Clear Everything
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
