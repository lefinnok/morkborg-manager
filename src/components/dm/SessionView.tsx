import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { localStorageService } from '../../services';
import type { DMSession } from '../../types';
import CombatTab from './CombatTab';
import OverviewTab from './OverviewTab';
import ReferenceTab from './ReferenceTab';

export default function SessionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<DMSession | null>(null);

  // Determine current tab from URL
  const currentTab = location.pathname.split('/').pop() || 'overview';

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    if (!id) return;
    const sess = await localStorageService.getSessionById(id);
    if (sess) {
      setSession(sess);
    } else {
      navigate('/dm');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(`/dm/session/${id}/${newValue}`);
  };

  const updateSession = async (updated: DMSession) => {
    await localStorageService.updateSession(updated);
    setSession(updated);
  };

  if (!session) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/dm')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {session.name}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Overview" value="overview" />
            <Tab label="Combat" value="combat" />
            <Tab label="Reference" value="reference" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {currentTab === 'overview' && (
          <OverviewTab session={session} updateSession={updateSession} />
        )}
        {currentTab === 'combat' && (
          <CombatTab session={session} updateSession={updateSession} />
        )}
        {currentTab === 'reference' && (
          <ReferenceTab />
        )}
      </Box>
    </Container>
  );
}
