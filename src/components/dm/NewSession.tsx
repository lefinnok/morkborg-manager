import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';
import { localStorageService } from '../../services';
import type { DMSession } from '../../types';

export default function NewSession() {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');

  const handleCreate = async () => {
    if (!sessionName.trim()) return;

    const newSession: DMSession = {
      id: uuidv4(),
      name: sessionName.trim(),
      notes: '',
      calendarState: {
        miseriesOccurred: [],
        currentDie: 'd6',
        miseriesCount: 0,
      },
      characters: [],
      enemyStatblocks: [],
      enemies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await localStorageService.createSession(newSession);
    navigate(`/dm/session/${newSession.id}/overview`);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/dm')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            New Session
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              fullWidth
              autoFocus
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dm')}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={!sessionName.trim()}
                fullWidth
              >
                Create Session
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
