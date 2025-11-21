import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { localStorageService } from '../../services';
import { decompressCharacter } from '../../utils/qrCode';
import type { Character } from '../../types';

export default function ImportCharacter() {
  const navigate = useNavigate();
  const [qrInput, setQrInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImportQR = async () => {
    setError(null);
    setSuccess(false);

    const character = decompressCharacter(qrInput);
    if (!character) {
      setError('Invalid QR code data. Please check and try again.');
      return;
    }

    try {
      // Check if character already exists
      const existing = await localStorageService.getCharacterById(character.id);
      if (existing) {
        setError('A character with this ID already exists. Please delete it first or edit the character ID.');
        return;
      }

      await localStorageService.createCharacter(character);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/player/sheet/${character.id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to import character. Please try again.');
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const character = JSON.parse(text) as Character;

      // Basic validation
      if (!character.id || !character.name || !character.class) {
        setError('Invalid character file format.');
        return;
      }

      // Check if character already exists
      const existing = await localStorageService.getCharacterById(character.id);
      if (existing) {
        setError('A character with this ID already exists. Please delete it first or edit the character ID.');
        return;
      }

      await localStorageService.createCharacter(character);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/player/sheet/${character.id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to parse JSON file. Please check the file format.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/player')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Import Character
          </Typography>
        </Box>

        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success">
              Character imported successfully! Redirecting...
            </Alert>
          )}

          {/* QR Code Import */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import from QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Paste the QR code data (starts with "MB:")
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="MB:..."
              />
              <Button
                variant="contained"
                onClick={handleImportQR}
                disabled={!qrInput.trim() || success}
              >
                Import from QR
              </Button>
            </Stack>
          </Paper>

          {/* JSON File Import */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import from JSON File
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a character JSON file
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={success}
              fullWidth
            >
              Choose File
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportJSON}
              />
            </Button>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
