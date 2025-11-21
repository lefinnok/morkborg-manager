import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  TextField,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { v4 as uuidv4 } from 'uuid';
import { localStorageService, contentService } from '../../services';
import type { DMSession, Character, SessionCharacter, EnemyStatblock, EnemyInstance } from '../../types';

interface CombatTabProps {
  session: DMSession;
  updateSession: (session: DMSession) => Promise<void>;
}

export default function CombatTab({ session, updateSession }: CombatTabProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [addCharDialogOpen, setAddCharDialogOpen] = useState(false);
  const [addEnemyDialogOpen, setAddEnemyDialogOpen] = useState(false);
  const [createStatblockOpen, setCreateStatblockOpen] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);

  // New statblock form
  const [statblockName, setStatblockName] = useState('');
  const [statblockHP, setStatblockHP] = useState('d8');
  const [statblockMorale, setStatblockMorale] = useState(6);
  const [statblockArmor, setStatblockArmor] = useState('none');
  const [statblockAttack, setStatblockAttack] = useState('d6');
  const [statblockSpecial, setStatblockSpecial] = useState('');

  // New enemy instance form
  const [selectedStatblockId, setSelectedStatblockId] = useState<string>('');
  const [enemyName, setEnemyName] = useState('');
  const [enemyHP, setEnemyHP] = useState(0);

  useEffect(() => {
    loadCharacters();
    loadAvailableCharacters();
  }, [session]);

  const loadCharacters = async () => {
    const allChars = await localStorageService.getAllCharacters();
    const sessionCharIds = session.characters.map(sc => sc.characterId);
    const filtered = allChars.filter(c => sessionCharIds.includes(c.id));
    setCharacters(filtered);
  };

  const loadAvailableCharacters = async () => {
    const allChars = await localStorageService.getAllCharacters();
    const sessionCharIds = session.characters.map(sc => sc.characterId);
    const available = allChars.filter(c => !sessionCharIds.includes(c.id));
    setAvailableCharacters(available);
  };

  // Character management
  const handleAddCharacter = async (characterId: string) => {
    const newSessionChar: SessionCharacter = {
      characterId,
      initiative: 0,
      statusNotes: '',
    };
    const updated = {
      ...session,
      characters: [...session.characters, newSessionChar],
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
    setAddCharDialogOpen(false);
    loadCharacters();
    loadAvailableCharacters();
  };

  const handleRemoveCharacter = async (characterId: string) => {
    const updated = {
      ...session,
      characters: session.characters.filter(sc => sc.characterId !== characterId),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
    loadCharacters();
    loadAvailableCharacters();
  };

  const handleUpdateCharacterInitiative = async (characterId: string, initiative: number) => {
    const updated = {
      ...session,
      characters: session.characters.map(sc =>
        sc.characterId === characterId ? { ...sc, initiative } : sc
      ),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  const handleUpdateCharacterNotes = async (characterId: string, statusNotes: string) => {
    const updated = {
      ...session,
      characters: session.characters.map(sc =>
        sc.characterId === characterId ? { ...sc, statusNotes } : sc
      ),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  // Enemy Statblock management
  const handleCreateStatblock = async () => {
    if (!statblockName.trim()) return;

    const newStatblock: EnemyStatblock = {
      id: uuidv4(),
      name: statblockName.trim(),
      hp: statblockHP,
      morale: statblockMorale,
      armor: statblockArmor,
      attack: statblockAttack,
      special: statblockSpecial,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...session,
      enemyStatblocks: [...session.enemyStatblocks, newStatblock],
      updatedAt: new Date().toISOString(),
    };

    await updateSession(updated);
    setCreateStatblockOpen(false);
    resetStatblockForm();
  };

  const resetStatblockForm = () => {
    setStatblockName('');
    setStatblockHP('d8');
    setStatblockMorale(6);
    setStatblockArmor('none');
    setStatblockAttack('d6');
    setStatblockSpecial('');
  };

  const handleImportDefaultEnemies = async () => {
    const defaultEnemies = contentService.getEnemies();
    const newStatblocks: EnemyStatblock[] = defaultEnemies.map(enemy => ({
      id: uuidv4(),
      name: enemy.name,
      hp: enemy.hp,
      morale: enemy.morale,
      armor: enemy.armor,
      attack: enemy.attack,
      special: enemy.special,
      createdAt: new Date().toISOString(),
    }));

    const updated = {
      ...session,
      enemyStatblocks: [...(session.enemyStatblocks || []), ...newStatblocks],
      updatedAt: new Date().toISOString(),
    };

    await updateSession(updated);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const data = JSON.parse(text);
        const enemies = data.enemies || [];

        const newStatblocks: EnemyStatblock[] = enemies.map((enemy: any) => ({
          id: uuidv4(),
          name: enemy.name,
          hp: enemy.hp,
          morale: enemy.morale,
          armor: enemy.armor,
          attack: enemy.attack,
          special: enemy.special || '',
          createdAt: new Date().toISOString(),
        }));

        const updated = {
          ...session,
          enemyStatblocks: [...(session.enemyStatblocks || []), ...newStatblocks],
          updatedAt: new Date().toISOString(),
        };

        await updateSession(updated);
      } catch (error) {
        console.error('Failed to import enemies:', error);
        alert('Failed to import enemies. Please check the JSON format.');
      }
    };
    input.click();
  };

  const handleExportStatblocks = () => {
    const exportData = {
      version: '1.0.0',
      name: `${session.name} - Enemy Statblocks`,
      enemies: (session.enemyStatblocks || []).map(sb => ({
        id: sb.id,
        name: sb.name,
        hp: sb.hp,
        morale: sb.morale,
        armor: sb.armor,
        attack: sb.attack,
        special: sb.special,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.replace(/\s+/g, '_')}_enemies.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Enemy Instance management
  const handleAddEnemy = async () => {
    if (!selectedStatblockId || !enemyName.trim() || enemyHP <= 0) return;

    const newEnemy: EnemyInstance = {
      id: uuidv4(),
      statblockId: selectedStatblockId,
      name: enemyName.trim(),
      currentHP: enemyHP,
      maxHP: enemyHP,
      initiative: 0,
      statusNotes: '',
    };

    const updated = {
      ...session,
      enemies: [...session.enemies, newEnemy],
      updatedAt: new Date().toISOString(),
    };

    await updateSession(updated);
    setAddEnemyDialogOpen(false);
    resetEnemyForm();
  };

  const resetEnemyForm = () => {
    setSelectedStatblockId('');
    setEnemyName('');
    setEnemyHP(0);
  };

  const handleRemoveEnemy = async (enemyId: string) => {
    const updated = {
      ...session,
      enemies: session.enemies.filter(e => e.id !== enemyId),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  const handleUpdateEnemyHP = async (enemyId: string, currentHP: number) => {
    const updated = {
      ...session,
      enemies: session.enemies.map(e =>
        e.id === enemyId ? { ...e, currentHP: Math.max(0, Math.min(e.maxHP, currentHP)) } : e
      ),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  const handleUpdateEnemyInitiative = async (enemyId: string, initiative: number) => {
    const updated = {
      ...session,
      enemies: session.enemies.map(e =>
        e.id === enemyId ? { ...e, initiative } : e
      ),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  const handleUpdateEnemyNotes = async (enemyId: string, statusNotes: string) => {
    const updated = {
      ...session,
      enemies: session.enemies.map(e =>
        e.id === enemyId ? { ...e, statusNotes } : e
      ),
      updatedAt: new Date().toISOString(),
    };
    await updateSession(updated);
  };

  // Combined and sorted combat order
  type CombatEntry =
    | { type: 'character'; data: SessionCharacter; character: Character }
    | { type: 'enemy'; data: EnemyInstance };

  const combatOrder: CombatEntry[] = [
    ...session.characters.map(sc => {
      const char = characters.find(c => c.id === sc.characterId);
      return char ? { type: 'character' as const, data: sc, character: char } : null;
    }).filter((e): e is NonNullable<typeof e> => e !== null),
    ...(session.enemies || []).map(e => ({ type: 'enemy' as const, data: e })),
  ].sort((a, b) => {
    const initA = a.type === 'character' ? a.data.initiative : a.data.initiative;
    const initB = b.type === 'character' ? b.data.initiative : b.data.initiative;
    return initB - initA;
  });

  return (
    <Box>
      <Stack spacing={3}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setAddCharDialogOpen(true)}
          >
            Add Player Character
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddEnemyDialogOpen(true)}
            color="secondary"
          >
            Add Enemy
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCreateStatblockOpen(true)}
          >
            Create Statblock
          </Button>
          <Button
            variant="outlined"
            startIcon={<LibraryAddIcon />}
            onClick={handleImportDefaultEnemies}
          >
            Import Defaults
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportJSON}
          >
            Import JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportStatblocks}
            disabled={(session.enemyStatblocks || []).length === 0}
          >
            Export Statblocks
          </Button>
        </Box>

        {/* Combat Order */}
        {combatOrder.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No combatants yet. Add player characters or enemies to start tracking combat.
            </Typography>
          </Paper>
        ) : (
          <Paper>
            <List>
              {combatOrder.map((entry, index) => (
                <ListItem
                  key={entry.type === 'character' ? entry.data.characterId : entry.data.id}
                  divider={index < combatOrder.length - 1}
                  sx={{ py: 2 }}
                >
                  {entry.type === 'character' ? (
                    /* Character Entry */
                    <Box sx={{ width: '100%', display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={entry.data.initiative}
                        onChange={(e) => handleUpdateCharacterInitiative(entry.data.characterId, parseInt(e.target.value) || 0)}
                        label="Init"
                        sx={{ width: '60px' }}
                      />
                      <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {entry.character.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Player Character
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: '120px' }}>
                        <Typography variant="body2">
                          HP: {entry.character.hpOmens.currentHP}/{entry.character.hpOmens.maxHP}
                        </Typography>
                        <Typography variant="body2">
                          Omens: {entry.character.hpOmens.currentOmens}/{entry.character.hpOmens.maxOmens}
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Status notes..."
                        value={entry.data.statusNotes}
                        onChange={(e) => handleUpdateCharacterNotes(entry.data.characterId, e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveCharacter(entry.data.characterId)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    /* Enemy Entry */
                    <Box sx={{ width: '100%', display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={entry.data.initiative}
                        onChange={(e) => handleUpdateEnemyInitiative(entry.data.id, parseInt(e.target.value) || 0)}
                        label="Init"
                        sx={{ width: '60px' }}
                      />
                      <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                          {entry.data.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enemy
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: '120px' }}>
                        <TextField
                          size="small"
                          type="number"
                          value={entry.data.currentHP}
                          onChange={(e) => handleUpdateEnemyHP(entry.data.id, parseInt(e.target.value) || 0)}
                          label="HP"
                          sx={{ width: '60px' }}
                        />
                        <Typography variant="body2">
                          / {entry.data.maxHP}
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Status notes..."
                        value={entry.data.statusNotes}
                        onChange={(e) => handleUpdateEnemyNotes(entry.data.id, e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveEnemy(entry.data.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Enemy Statblocks */}
        {(session.enemyStatblocks || []).length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enemy Statblocks
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {(session.enemyStatblocks || []).map((statblock) => (
                <Paper key={statblock.id} sx={{ p: 2, minWidth: '300px', flex: '1 1 45%' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {statblock.name}
                  </Typography>
                  <Typography variant="body2">HP: {statblock.hp}</Typography>
                  <Typography variant="body2">Morale: {statblock.morale}</Typography>
                  <Typography variant="body2">Armor: {statblock.armor}</Typography>
                  <Typography variant="body2">Attack: {statblock.attack}</Typography>
                  {statblock.special && (
                    <Typography variant="body2" color="text.secondary">
                      Special: {statblock.special}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Stack>

      {/* Add Character Dialog */}
      <Dialog open={addCharDialogOpen} onClose={() => setAddCharDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Player Character</DialogTitle>
        <DialogContent>
          {availableCharacters.length === 0 ? (
            <Typography color="text.secondary">
              No available characters. All characters are already in combat.
            </Typography>
          ) : (
            <List>
              {availableCharacters.map((char) => (
                <ListItem key={char.id} disablePadding>
                  <ListItemButton onClick={() => handleAddCharacter(char.id)}>
                    <Box>
                      <Typography variant="subtitle1">{char.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        HP: {char.hpOmens.currentHP}/{char.hpOmens.maxHP}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCharDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create Enemy Statblock Dialog */}
      <Dialog open={createStatblockOpen} onClose={() => setCreateStatblockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Enemy Statblock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Enemy Name"
              value={statblockName}
              onChange={(e) => setStatblockName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="HP (dice notation)"
              value={statblockHP}
              onChange={(e) => setStatblockHP(e.target.value)}
              placeholder="e.g., d8, 2d6+2"
              fullWidth
            />
            <TextField
              label="Morale"
              type="number"
              value={statblockMorale}
              onChange={(e) => setStatblockMorale(parseInt(e.target.value) || 0)}
              fullWidth
            />
            <TextField
              label="Armor"
              value={statblockArmor}
              onChange={(e) => setStatblockArmor(e.target.value)}
              placeholder="e.g., none, -d2, -d4"
              fullWidth
            />
            <TextField
              label="Attack (dice notation)"
              value={statblockAttack}
              onChange={(e) => setStatblockAttack(e.target.value)}
              placeholder="e.g., d6, 2d4"
              fullWidth
            />
            <TextField
              label="Special Abilities"
              value={statblockSpecial}
              onChange={(e) => setStatblockSpecial(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateStatblockOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateStatblock}
            variant="contained"
            disabled={!statblockName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Enemy Instance Dialog */}
      <Dialog open={addEnemyDialogOpen} onClose={() => setAddEnemyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Enemy</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(session.enemyStatblocks || []).length === 0 ? (
              <Typography color="text.secondary">
                No enemy statblocks created yet. Create a statblock first.
              </Typography>
            ) : (
              <>
                <TextField
                  select
                  label="Enemy Type"
                  value={selectedStatblockId}
                  onChange={(e) => setSelectedStatblockId(e.target.value)}
                  SelectProps={{ native: true }}
                  fullWidth
                  required
                >
                  <option value="">Select statblock...</option>
                  {(session.enemyStatblocks || []).map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.name}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="Name (e.g., Goblin 1)"
                  value={enemyName}
                  onChange={(e) => setEnemyName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Starting HP"
                  type="number"
                  value={enemyHP || ''}
                  onChange={(e) => setEnemyHP(parseInt(e.target.value) || 0)}
                  fullWidth
                  required
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEnemyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddEnemy}
            variant="contained"
            disabled={!selectedStatblockId || !enemyName.trim() || enemyHP <= 0}
          >
            Add Enemy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
