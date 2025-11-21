import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import { localStorageService } from '../../services';
import type { UserRole } from '../../types';

export default function LandingPage() {
  const navigate = useNavigate();
  const [lastRole, setLastRole] = useState<UserRole | null>(null);

  useEffect(() => {
    localStorageService.getUserData().then(userData => {
      setLastRole(userData.lastRole);
    });
  }, []);

  const handleRoleSelect = async (role: UserRole) => {
    await localStorageService.updateUserData({ lastRole: role });

    if (role === 'player') {
      navigate('/player');
    } else {
      navigate('/dm');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            MÖRK BORG
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
            Manager
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 3, mb: 4 }}>
            Select your role to begin
          </Typography>

          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => handleRoleSelect('player')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
              }}
            >
              I'm a Player
            </Button>

            <Button
              variant="contained"
              size="large"
              startIcon={<GavelIcon />}
              onClick={() => handleRoleSelect('dm')}
              color="secondary"
              sx={{
                py: 2,
                fontSize: '1.1rem',
              }}
            >
              I'm a DM
            </Button>
          </Stack>

          {lastRole && (
            <Typography variant="caption" display="block" sx={{ mt: 3 }} color="text.secondary">
              Last used: {lastRole === 'player' ? 'Player' : 'DM'} mode
            </Typography>
          )}
        </Paper>

        <Typography variant="caption" display="block" sx={{ mt: 3 }} color="text.secondary">
          A digital companion for Mörk Borg TTRPG
        </Typography>
      </Box>
    </Container>
  );
}
