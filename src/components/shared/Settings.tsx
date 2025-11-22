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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import { localStorageService, contentService } from '../../services';
import ThemeToggle from './ThemeToggle';

export default function Settings() {
  const navigate = useNavigate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleUploadContent = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await contentService.uploadCustomContent(text);
        setUploadSuccess(true);
        setUploadError(null);
        setTimeout(() => {
          setUploadSuccess(false);
          window.location.reload(); // Reload to show new content
        }, 2000);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Failed to upload content');
        setTimeout(() => setUploadError(null), 5000);
      }
    };
    input.click();
  };

  const handleExportContent = () => {
    const content = contentService.exportContent();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'morkborg-content.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetContent = async () => {
    await contentService.resetToDefault();
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
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

        {uploadSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Content uploaded successfully! Reloading...
          </Alert>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {uploadError}
          </Alert>
        )}

        {resetSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Content reset to defaults! Reloading...
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

          {/* Content Management Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload custom classes, items, enemies, and other game content. Custom content will be merged with default content.
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={handleUploadContent}
                fullWidth
              >
                Upload Custom Content (JSON)
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportContent}
                fullWidth
              >
                Export Current Content
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleResetContent}
                fullWidth
              >
                Reset to Default Content
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              JSON format example: {`{ "classes": [...], "equipment": { "weapons": [...], "armor": [...], "items": [...] }, "powers": [...], "enemies": [...] }`}
            </Typography>
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
