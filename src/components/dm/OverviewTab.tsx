import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { localStorageService } from '../../services';
import type { DMSession, Character } from '../../types';

interface OverviewTabProps {
  session: DMSession;
  updateSession: (session: DMSession) => Promise<void>;
}

export default function OverviewTab({ session, updateSession }: OverviewTabProps) {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    loadCharacters();
  }, [session]);

  const loadCharacters = async () => {
    const allChars = await localStorageService.getAllCharacters();
    const sessionCharIds = session.characters.map(sc => sc.characterId);
    const filtered = allChars.filter(c => sessionCharIds.includes(c.id));
    setCharacters(filtered);
  };

  const handleNotesChange = async (notes: string) => {
    const updated = {
      ...session,
      notes,
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Session Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(session.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {new Date(session.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Calendar State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Calendar of Nechrubel
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Die:
                </Typography>
                <Chip label={session.calendarState.currentDie} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Miseries Count: {session.calendarState.miseriesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Miseries Occurred: {session.calendarState.miseriesOccurred.length > 0
                  ? session.calendarState.miseriesOccurred.join(', ')
                  : 'None yet'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Characters */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Characters ({characters.length})
          </Typography>
          {characters.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No characters added to this session yet.
            </Typography>
          ) : (
            <List>
              {characters.map((char, index) => (
                <ListItem
                  key={char.id}
                  divider={index < characters.length - 1}
                  disablePadding
                  sx={{ py: 1 }}
                >
                  <ListItemText
                    primary={char.name}
                    secondary={`HP: ${char.hpOmens.currentHP}/${char.hpOmens.maxHP} | Omens: ${char.hpOmens.currentOmens}/${char.hpOmens.maxOmens}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Session Notes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={session.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Session notes, story progress, important events..."
            variant="outlined"
          />
        </Paper>
      </Stack>
    </Box>
  );
}
