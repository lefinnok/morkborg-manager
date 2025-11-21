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
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { localStorageService, contentService } from '../../services';
import type { Character } from '../../types';

export default function PlayerApp() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await localStorageService.getAllCharacters();
    setCharacters(chars);
  };

  const handleSwitchRole = async () => {
    await localStorageService.updateUserData({ lastRole: 'dm' });
    navigate('/dm');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Characters
          </Typography>
          <IconButton onClick={handleSwitchRole} title="Switch to DM mode">
            <SwitchAccountIcon />
          </IconButton>
        </Box>

        <Stack spacing={2}>
          {characters.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No characters yet. Create your first character to begin your journey.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/player/create')}
                >
                  Create Character
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={() => navigate('/player/import')}
                >
                  Import Character
                </Button>
              </Stack>
            </Paper>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/player/create')}
                  fullWidth
                >
                  New Character
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={() => navigate('/player/import')}
                  fullWidth
                >
                  Import
                </Button>
              </Box>

              <Paper>
                <List>
                  {characters.map((char, index) => (
                    <ListItem
                      key={char.id}
                      divider={index < characters.length - 1}
                      disablePadding
                    >
                      <ListItemButton onClick={() => navigate(`/player/sheet/${char.id}`)}>
                        <ListItemText
                          primary={char.name}
                          secondary={`${contentService.getClass(char.class)?.name || char.class} - HP: ${char.hpOmens.currentHP}/${char.hpOmens.maxHP}`}
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
