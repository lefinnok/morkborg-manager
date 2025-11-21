import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { localStorageService } from '../../services';
import type { DMSession } from '../../types';

export default function DMApp() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DMSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await localStorageService.getAllSessions();
    setSessions(allSessions);
  };

  const handleSwitchRole = async () => {
    await localStorageService.updateUserData({ lastRole: 'player' });
    navigate('/player');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            DM Sessions
          </Typography>
          <IconButton onClick={handleSwitchRole} title="Switch to Player mode">
            <SwitchAccountIcon />
          </IconButton>
        </Box>

        <Stack spacing={2}>
          {sessions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No sessions yet. Create your first session to begin.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dm/session/new')}
              >
                Create Session
              </Button>
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/dm/session/new')}
                  fullWidth
                >
                  New Session
                </Button>
              </Box>

              <Paper>
                <List>
                  {sessions.map((session, index) => (
                    <ListItem
                      key={session.id}
                      divider={index < sessions.length - 1}
                      disablePadding
                    >
                      <ListItemButton onClick={() => navigate(`/dm/session/${session.id}/overview`)}>
                        <ListItemText
                          primary={session.name}
                          secondary={`${session.characters.length} characters | Created ${new Date(session.createdAt).toLocaleDateString()}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
