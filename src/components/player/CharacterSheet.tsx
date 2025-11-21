import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CasinoIcon from '@mui/icons-material/Casino';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { localStorageService, contentService } from '../../services';
import type { Character } from '../../types';
import { abilityScoreToModifier, formatModifier, rollD20 } from '../../utils/dice';
import { compressCharacter } from '../../utils/qrCode';
import QRCodeDialog from '../shared/QRCodeDialog';

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [rollDialogOpen, setRollDialogOpen] = useState(false);
  const [rollResult, setRollResult] = useState<{ roll: number; modifier: number; total: number } | null>(null);
  const [rollType, setRollType] = useState<string>('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Equipment management dialogs
  const [weaponDialogOpen, setWeaponDialogOpen] = useState(false);
  const [armorDialogOpen, setArmorDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // Edit states for each field
  const [editingMaxHP, setEditingMaxHP] = useState(false);
  const [editingMaxOmens, setEditingMaxOmens] = useState(false);
  const [editingMaxPowers, setEditingMaxPowers] = useState(false);
  const [editingSilver, setEditingSilver] = useState(false);

  // Temp values while editing
  const [tempMaxHP, setTempMaxHP] = useState('');
  const [tempMaxOmens, setTempMaxOmens] = useState('');
  const [tempMaxPowers, setTempMaxPowers] = useState('');
  const [tempSilver, setTempSilver] = useState('');

  // Edit states for abilities
  const [editingStrength, setEditingStrength] = useState(false);
  const [editingAgility, setEditingAgility] = useState(false);
  const [editingPresence, setEditingPresence] = useState(false);
  const [editingToughness, setEditingToughness] = useState(false);

  // Temp values for abilities
  const [tempStrength, setTempStrength] = useState('');
  const [tempAgility, setTempAgility] = useState('');
  const [tempPresence, setTempPresence] = useState('');
  const [tempToughness, setTempToughness] = useState('');

  useEffect(() => {
    if (id) {
      loadCharacter();
    }
  }, [id]);

  const loadCharacter = async () => {
    if (!id) return;
    const char = await localStorageService.getCharacterById(id);
    if (char) {
      setCharacter(char);
    } else {
      navigate('/player');
    }
  };

  const updateCharacter = async (updated: Character) => {
    await localStorageService.updateCharacter(updated);
    setCharacter(updated);
  };

  const adjustHP = (delta: number) => {
    if (!character) return;
    const newHP = Math.max(0, Math.min(character.hpOmens.maxHP, character.hpOmens.currentHP + delta));
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentHP: newHP },
    });
  };

  const adjustOmens = (delta: number) => {
    if (!character) return;
    const newOmens = Math.max(0, Math.min(character.hpOmens.maxOmens, character.hpOmens.currentOmens + delta));
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentOmens: newOmens },
    });
  };

  const adjustPowers = (delta: number) => {
    if (!character) return;
    const newPowers = Math.max(0, Math.min(character.hpOmens.maxPowers, character.hpOmens.currentPowers + delta));
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentPowers: newPowers },
    });
  };

  const adjustAmmo = (delta: number) => {
    if (!character) return;
    const newAmmo = Math.max(0, character.ammo + delta);
    updateCharacter({ ...character, ammo: newAmmo });
  };

  const toggleInfected = () => {
    if (!character) return;
    updateCharacter({ ...character, infected: !character.infected });
  };

  const handleRoll = (type: string, modifier: number) => {
    const roll = rollD20();
    const total = roll + modifier;
    setRollType(type);
    setRollResult({ roll, modifier, total });
    setRollDialogOpen(true);
  };

  const handleExport = () => {
    if (!character) return;
    const dataStr = JSON.stringify(character, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShowQR = () => {
    if (!character) return;
    const compressed = compressCharacter(character);
    setQrData(compressed);
    setQrDialogOpen(true);
  };

  const handleSwitchRole = async () => {
    await localStorageService.updateUserData({ lastRole: 'dm' });
    navigate('/dm');
  };

  // Edit handlers for MaxHP
  const startEditMaxHP = () => {
    if (!character) return;
    setTempMaxHP(character.hpOmens.maxHP.toString());
    setEditingMaxHP(true);
  };

  const saveMaxHP = () => {
    if (!character) return;
    const value = parseInt(tempMaxHP);
    if (!isNaN(value) && value > 0) {
      updateCharacter({
        ...character,
        hpOmens: {
          ...character.hpOmens,
          maxHP: value,
          currentHP: Math.min(character.hpOmens.currentHP, value),
        },
      });
    }
    setEditingMaxHP(false);
  };

  const restoreHP = () => {
    if (!character) return;
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentHP: character.hpOmens.maxHP },
    });
  };

  // Edit handlers for MaxOmens
  const startEditMaxOmens = () => {
    if (!character) return;
    setTempMaxOmens(character.hpOmens.maxOmens.toString());
    setEditingMaxOmens(true);
  };

  const saveMaxOmens = () => {
    if (!character) return;
    const value = parseInt(tempMaxOmens);
    if (!isNaN(value) && value >= 0) {
      updateCharacter({
        ...character,
        hpOmens: {
          ...character.hpOmens,
          maxOmens: value,
          currentOmens: Math.min(character.hpOmens.currentOmens, value),
        },
      });
    }
    setEditingMaxOmens(false);
  };

  const restoreOmens = () => {
    if (!character) return;
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentOmens: character.hpOmens.maxOmens },
    });
  };

  // Edit handlers for MaxPowers
  const startEditMaxPowers = () => {
    if (!character) return;
    setTempMaxPowers(character.hpOmens.maxPowers.toString());
    setEditingMaxPowers(true);
  };

  const saveMaxPowers = () => {
    if (!character) return;
    const value = parseInt(tempMaxPowers);
    if (!isNaN(value) && value >= 0) {
      updateCharacter({
        ...character,
        hpOmens: {
          ...character.hpOmens,
          maxPowers: value,
          currentPowers: Math.min(character.hpOmens.currentPowers, value),
        },
      });
    }
    setEditingMaxPowers(false);
  };

  const restorePowers = () => {
    if (!character) return;
    updateCharacter({
      ...character,
      hpOmens: { ...character.hpOmens, currentPowers: character.hpOmens.maxPowers },
    });
  };

  // Edit handlers for Silver
  const startEditSilver = () => {
    if (!character) return;
    setTempSilver(character.silver.toString());
    setEditingSilver(true);
  };

  const saveSilver = () => {
    if (!character) return;
    const value = parseInt(tempSilver);
    if (!isNaN(value) && value >= 0) {
      updateCharacter({ ...character, silver: value });
    }
    setEditingSilver(false);
  };

  // Edit handlers for Abilities
  const startEditStrength = () => {
    if (!character) return;
    setTempStrength(character.abilities.strength.toString());
    setEditingStrength(true);
  };

  const saveStrength = () => {
    if (!character) return;
    const value = parseInt(tempStrength);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      updateCharacter({
        ...character,
        abilities: { ...character.abilities, strength: value },
      });
    }
    setEditingStrength(false);
  };

  const startEditAgility = () => {
    if (!character) return;
    setTempAgility(character.abilities.agility.toString());
    setEditingAgility(true);
  };

  const saveAgility = () => {
    if (!character) return;
    const value = parseInt(tempAgility);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      updateCharacter({
        ...character,
        abilities: { ...character.abilities, agility: value },
      });
    }
    setEditingAgility(false);
  };

  const startEditPresence = () => {
    if (!character) return;
    setTempPresence(character.abilities.presence.toString());
    setEditingPresence(true);
  };

  const savePresence = () => {
    if (!character) return;
    const value = parseInt(tempPresence);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      updateCharacter({
        ...character,
        abilities: { ...character.abilities, presence: value },
      });
    }
    setEditingPresence(false);
  };

  const startEditToughness = () => {
    if (!character) return;
    setTempToughness(character.abilities.toughness.toString());
    setEditingToughness(true);
  };

  const saveToughness = () => {
    if (!character) return;
    const value = parseInt(tempToughness);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      updateCharacter({
        ...character,
        abilities: { ...character.abilities, toughness: value },
      });
    }
    setEditingToughness(false);
  };

  // Equipment handlers
  const handleSelectWeapon = (weaponId: string) => {
    if (!character) return;
    const weapons = contentService.getEquipment().weapons;
    const selectedWeapon = weapons.find(w => w.id === weaponId);
    if (selectedWeapon) {
      updateCharacter({
        ...character,
        weapon: {
          name: selectedWeapon.name,
          damage: selectedWeapon.damage,
          type: selectedWeapon.type,
        },
      });
    }
    setWeaponDialogOpen(false);
  };

  const handleRemoveWeapon = () => {
    if (!character) return;
    updateCharacter({ ...character, weapon: null });
  };

  const handleSelectArmor = (armorId: string) => {
    if (!character) return;
    const armors = contentService.getEquipment().armor;
    const selectedArmor = armors.find(a => a.id === armorId);
    if (selectedArmor) {
      updateCharacter({
        ...character,
        armor: selectedArmor.tier === 0 ? null : {
          name: selectedArmor.name,
          tier: selectedArmor.tier,
          damageReduction: selectedArmor.damageReduction,
          drModifier: selectedArmor.drModifier,
          agilityModifier: selectedArmor.agilityModifier,
        },
      });
    }
    setArmorDialogOpen(false);
  };

  const handleRemoveArmor = () => {
    if (!character) return;
    updateCharacter({ ...character, armor: null });
  };

  const handleAddItem = (itemId: string) => {
    if (!character) return;
    const items = contentService.getEquipment().items;
    const selectedItem = items.find(i => i.id === itemId);
    if (!selectedItem) return;

    const existingItemIndex = character.equipment.findIndex(e => e.id === itemId);
    if (existingItemIndex >= 0) {
      const updatedEquipment = [...character.equipment];
      updatedEquipment[existingItemIndex] = {
        ...updatedEquipment[existingItemIndex],
        quantity: updatedEquipment[existingItemIndex].quantity + 1,
      };
      updateCharacter({ ...character, equipment: updatedEquipment });
    } else {
      const newItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        type: 'item',
        description: selectedItem.description,
        quantity: 1,
        silver: selectedItem.silver,
      };
      updateCharacter({ ...character, equipment: [...character.equipment, newItem] });
    }
    setItemDialogOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!character) return;
    const itemIndex = character.equipment.findIndex(e => e.id === itemId);
    if (itemIndex < 0) return;

    const updatedEquipment = [...character.equipment];
    if (updatedEquipment[itemIndex].quantity > 1) {
      updatedEquipment[itemIndex] = {
        ...updatedEquipment[itemIndex],
        quantity: updatedEquipment[itemIndex].quantity - 1,
      };
    } else {
      updatedEquipment.splice(itemIndex, 1);
    }
    updateCharacter({ ...character, equipment: updatedEquipment });
  };

  const handleDeleteCharacter = async () => {
    if (!character) return;
    await localStorageService.deleteCharacter(character.id);
    navigate('/player');
  };

  if (!character) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  const classDef = contentService.getClass(character.class);
  const abilities = character.abilities;
  const strMod = abilityScoreToModifier(abilities.strength);
  const agiMod = abilityScoreToModifier(abilities.agility);
  const preMod = abilityScoreToModifier(abilities.presence);
  const tghMod = abilityScoreToModifier(abilities.toughness);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/player')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                {character.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {classDef?.name || character.class}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleExport} title="Export Character">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleShowQR} title="QR Code">
              <QrCode2Icon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)} title="Delete Character" color="error">
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={handleSwitchRole} title="Switch to DM mode">
              <SwitchAccountIcon />
            </IconButton>
          </Box>
        </Box>

        {/* HP, Omens, Powers - Horizontal Bars */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* HP */}
            <Box sx={{ flex: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Hit Points
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => adjustHP(-1)} disabled={character.hpOmens.currentHP === 0}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: '60px', textAlign: 'center', fontWeight: 'bold' }}>
                      {character.hpOmens.currentHP}/{character.hpOmens.maxHP}
                    </Typography>
                    <IconButton size="small" onClick={() => adjustHP(1)} disabled={character.hpOmens.currentHP === character.hpOmens.maxHP}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Tooltip title={`${character.hpOmens.currentHP} / ${character.hpOmens.maxHP} HP`}>
                  <LinearProgress
                    variant="determinate"
                    value={(character.hpOmens.currentHP / character.hpOmens.maxHP) * 100}
                    sx={{
                      height: 16,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: character.hpOmens.currentHP <= character.hpOmens.maxHP * 0.25 ? 'error.main' :
                                       character.hpOmens.currentHP <= character.hpOmens.maxHP * 0.5 ? 'warning.main' : 'success.main',
                      },
                    }}
                  />
                </Tooltip>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button size="small" onClick={startEditMaxHP} startIcon={<EditIcon />}>
                    Edit Max
                  </Button>
                  <Button size="small" onClick={restoreHP} disabled={character.hpOmens.currentHP === character.hpOmens.maxHP} startIcon={<RestoreIcon />}>
                    Restore
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Omens */}
            <Box sx={{ flex: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Omens
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => adjustOmens(-1)} disabled={character.hpOmens.currentOmens === 0}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                      {character.hpOmens.currentOmens}/{character.hpOmens.maxOmens}
                    </Typography>
                    <IconButton size="small" onClick={() => adjustOmens(1)} disabled={character.hpOmens.currentOmens === character.hpOmens.maxOmens}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: 16 }}>
                  {Array.from({ length: character.hpOmens.maxOmens }).map((_, i) => (
                    <Tooltip key={i} title={`Omen ${i + 1}`}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: i < character.hpOmens.currentOmens ? 'primary.main' : 'rgba(0,0,0,0.1)',
                          border: '2px solid',
                          borderColor: i < character.hpOmens.currentOmens ? 'primary.dark' : 'rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                        onClick={() => {
                          const newValue = i < character.hpOmens.currentOmens ? i : i + 1;
                          updateCharacter({
                            ...character,
                            hpOmens: { ...character.hpOmens, currentOmens: newValue },
                          });
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button size="small" onClick={startEditMaxOmens} startIcon={<EditIcon />}>
                    Edit Max
                  </Button>
                  <Button size="small" onClick={restoreOmens} disabled={character.hpOmens.currentOmens === character.hpOmens.maxOmens} startIcon={<RestoreIcon />}>
                    Restore
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Powers */}
            <Box sx={{ flex: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Powers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => adjustPowers(-1)} disabled={character.hpOmens.currentPowers === 0}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                      {character.hpOmens.currentPowers}/{character.hpOmens.maxPowers}
                    </Typography>
                    <IconButton size="small" onClick={() => adjustPowers(1)} disabled={character.hpOmens.currentPowers === character.hpOmens.maxPowers}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: 16 }}>
                  {Array.from({ length: character.hpOmens.maxPowers }).map((_, i) => (
                    <Tooltip key={i} title={`Power ${i + 1}`}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: i < character.hpOmens.currentPowers ? 'secondary.main' : 'rgba(0,0,0,0.1)',
                          border: '2px solid',
                          borderColor: i < character.hpOmens.currentPowers ? 'secondary.dark' : 'rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                        onClick={() => {
                          const newValue = i < character.hpOmens.currentPowers ? i : i + 1;
                          updateCharacter({
                            ...character,
                            hpOmens: { ...character.hpOmens, currentPowers: newValue },
                          });
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button size="small" onClick={startEditMaxPowers} startIcon={<EditIcon />}>
                    Edit Max
                  </Button>
                  <Button size="small" onClick={restorePowers} disabled={character.hpOmens.currentPowers === character.hpOmens.maxPowers} startIcon={<RestoreIcon />}>
                    Restore
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Main 3-Column Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left Column: Abilities & Actions */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Abilities */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Abilities
                </Typography>
                <Stack spacing={1.5}>
                  {/* Strength */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Strength</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingStrength ? (
                        <>
                          <TextField
                            size="small"
                            value={tempStrength}
                            onChange={(e) => setTempStrength(e.target.value)}
                            sx={{ width: '60px' }}
                            type="number"
                            inputProps={{ min: 1, max: 20 }}
                          />
                          <IconButton onClick={saveStrength} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setEditingStrength(false)} size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight="bold">{abilities.strength} ({formatModifier(strMod)})</Typography>
                          <IconButton onClick={startEditStrength} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Agility */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Agility</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingAgility ? (
                        <>
                          <TextField
                            size="small"
                            value={tempAgility}
                            onChange={(e) => setTempAgility(e.target.value)}
                            sx={{ width: '60px' }}
                            type="number"
                            inputProps={{ min: 1, max: 20 }}
                          />
                          <IconButton onClick={saveAgility} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setEditingAgility(false)} size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight="bold">{abilities.agility} ({formatModifier(agiMod)})</Typography>
                          <IconButton onClick={startEditAgility} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Presence */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Presence</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingPresence ? (
                        <>
                          <TextField
                            size="small"
                            value={tempPresence}
                            onChange={(e) => setTempPresence(e.target.value)}
                            sx={{ width: '60px' }}
                            type="number"
                            inputProps={{ min: 1, max: 20 }}
                          />
                          <IconButton onClick={savePresence} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setEditingPresence(false)} size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight="bold">{abilities.presence} ({formatModifier(preMod)})</Typography>
                          <IconButton onClick={startEditPresence} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Toughness */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Toughness</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingToughness ? (
                        <>
                          <TextField
                            size="small"
                            value={tempToughness}
                            onChange={(e) => setTempToughness(e.target.value)}
                            sx={{ width: '60px' }}
                            type="number"
                            inputProps={{ min: 1, max: 20 }}
                          />
                          <IconButton onClick={saveToughness} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setEditingToughness(false)} size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight="bold">{abilities.toughness} ({formatModifier(tghMod)})</Typography>
                          <IconButton onClick={startEditToughness} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              {/* Actions */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Melee Attack</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CasinoIcon />}
                        onClick={() => handleRoll('Melee Attack', strMod)}
                      >
                        d20{formatModifier(strMod)}
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Roll vs DR12 to hit, then roll weapon damage
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Ranged Attack</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CasinoIcon />}
                        onClick={() => handleRoll('Ranged Attack', agiMod)}
                      >
                        d20{formatModifier(agiMod)}
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Roll vs DR12 to hit, then roll weapon damage
                    </Typography>

                    {/* Ammo Tracking */}
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold">
                          Ammo
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            value={character.ammo}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                updateCharacter({ ...character, ammo: value });
                              }
                            }}
                            type="number"
                            inputProps={{ min: 0, style: { padding: '2px 4px', textAlign: 'center' } }}
                            sx={{ width: '50px' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => adjustAmmo(-1)}
                            disabled={character.ammo === 0}
                            sx={{ padding: '2px' }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => adjustAmmo(1)}
                            sx={{ padding: '2px' }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      {character.ammo > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {Array.from({ length: character.ammo }).map((_, i) => (
                            <Tooltip key={i} title={`Ammo ${i + 1}`}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: 'warning.main',
                                  border: '1px solid',
                                  borderColor: 'warning.dark',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                  },
                                }}
                                onClick={() => {
                                  updateCharacter({ ...character, ammo: i });
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Defend</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CasinoIcon />}
                        onClick={() => handleRoll('Defend', agiMod)}
                      >
                        d20{formatModifier(agiMod)}
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Roll vs DR12 to dodge/parry attack
                    </Typography>
                  </Box>

                  {classDef?.specialAbilities.map((ability, idx) => (
                    <Box key={idx}>
                      <Typography variant="subtitle2">{ability.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ability.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* Middle Column: Resources & Equipment */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Status & Resources */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Resources
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Silver</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingSilver ? (
                        <>
                          <TextField
                            size="small"
                            value={tempSilver}
                            onChange={(e) => setTempSilver(e.target.value)}
                            sx={{ width: '80px' }}
                            type="number"
                          />
                          <IconButton onClick={saveSilver} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setEditingSilver(false)} size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography fontWeight="bold">{character.silver}</Typography>
                          <IconButton onClick={startEditSilver} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Chip
                      label={character.infected ? 'Infected' : 'Not Infected'}
                      color={character.infected ? 'error' : 'default'}
                      onClick={toggleInfected}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* Equipment */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Equipment
                </Typography>
                <Stack spacing={2}>
                  {/* Weapon */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Weapon</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => setWeaponDialogOpen(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {character.weapon && (
                          <IconButton size="small" onClick={handleRemoveWeapon} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {character.weapon ? (
                      <Typography variant="body2">
                        {character.weapon.name} ({character.weapon.damage} damage, {character.weapon.type})
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No weapon</Typography>
                    )}
                  </Box>

                  {/* Armor */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Armor</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => setArmorDialogOpen(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {character.armor && (
                          <IconButton size="small" onClick={handleRemoveArmor} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {character.armor ? (
                      <Typography variant="body2">
                        {character.armor.name} (Tier {character.armor.tier}, {character.armor.damageReduction} DR)
                        {character.armor.drModifier !== undefined && character.armor.drModifier !== 0 && (
                          <> | DR {character.armor.drModifier > 0 ? '+' : ''}{character.armor.drModifier}</>
                        )}
                        {character.armor.agilityModifier !== undefined && character.armor.agilityModifier !== 0 && (
                          <> | Agility {character.armor.agilityModifier > 0 ? '+' : ''}{character.armor.agilityModifier}</>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No armor</Typography>
                    )}
                  </Box>

                  {/* Items */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2">Items</Typography>
                      <IconButton size="small" onClick={() => setItemDialogOpen(true)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {character.equipment.length > 0 ? (
                      <List dense disablePadding>
                        {character.equipment.map((item) => (
                          <ListItem
                            key={item.id}
                            disablePadding
                            secondaryAction={
                              <IconButton edge="end" size="small" onClick={() => handleRemoveItem(item.id)}>
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={`${item.name} (x${item.quantity}) - ${item.silver}s each`}
                              secondary={item.description}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          {/* Right Column: Notes */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Character Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={character.notes}
                onChange={(e) => updateCharacter({ ...character, notes: e.target.value })}
                placeholder="Character notes, backstory, traits, etc."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start',
                  },
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Roll Dialog */}
      <Dialog open={rollDialogOpen} onClose={() => setRollDialogOpen(false)}>
        <DialogTitle>{rollType}</DialogTitle>
        <DialogContent>
          {rollResult && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" gutterBottom>
                {rollResult.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                d20: {rollResult.roll} {formatModifier(rollResult.modifier)} = {rollResult.total}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                {rollResult.total >= 12 ? '✓ Success (vs DR12)' : '✗ Failure (vs DR12)'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        data={qrData}
        title={`${character.name} - QR Code`}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Character?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{character.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCharacter} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Weapon Selection Dialog */}
      <Dialog open={weaponDialogOpen} onClose={() => setWeaponDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Weapon</DialogTitle>
        <DialogContent>
          <List>
            {contentService.getEquipment().weapons.map((weapon) => (
              <ListItem key={weapon.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectWeapon(weapon.id)}
                  selected={character.weapon?.name === weapon.name}
                >
                  <ListItemText
                    primary={weapon.name}
                    secondary={`${weapon.damage} damage (${weapon.type})`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeaponDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Armor Selection Dialog */}
      <Dialog open={armorDialogOpen} onClose={() => setArmorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Armor</DialogTitle>
        <DialogContent>
          <List>
            {contentService.getEquipment().armor.map((armor) => (
              <ListItem key={armor.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectArmor(armor.id)}
                  selected={character.armor?.name === armor.name}
                >
                  <ListItemText
                    primary={armor.name}
                    secondary={
                      `Tier ${armor.tier}, ${armor.damageReduction} damage reduction` +
                      (armor.drModifier !== undefined && armor.drModifier !== 0 ? ` | DR ${armor.drModifier > 0 ? '+' : ''}${armor.drModifier}` : '') +
                      (armor.agilityModifier !== undefined && armor.agilityModifier !== 0 ? ` | Agility ${armor.agilityModifier > 0 ? '+' : ''}${armor.agilityModifier}` : '')
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArmorDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Item Selection Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <List>
            {contentService.getEquipment().items.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton onClick={() => handleAddItem(item.id)}>
                  <ListItemText
                    primary={`${item.name} (${item.silver} silver)`}
                    secondary={item.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Max HP Dialog */}
      <Dialog open={editingMaxHP} onClose={() => setEditingMaxHP(false)}>
        <DialogTitle>Edit Max HP</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Max HP"
            type="number"
            fullWidth
            value={tempMaxHP}
            onChange={(e) => setTempMaxHP(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMaxHP(false)}>Cancel</Button>
          <Button onClick={saveMaxHP} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Max Omens Dialog */}
      <Dialog open={editingMaxOmens} onClose={() => setEditingMaxOmens(false)}>
        <DialogTitle>Edit Max Omens</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Max Omens"
            type="number"
            fullWidth
            value={tempMaxOmens}
            onChange={(e) => setTempMaxOmens(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMaxOmens(false)}>Cancel</Button>
          <Button onClick={saveMaxOmens} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Max Powers Dialog */}
      <Dialog open={editingMaxPowers} onClose={() => setEditingMaxPowers(false)}>
        <DialogTitle>Edit Max Powers</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Max Powers"
            type="number"
            fullWidth
            value={tempMaxPowers}
            onChange={(e) => setTempMaxPowers(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMaxPowers(false)}>Cancel</Button>
          <Button onClick={saveMaxPowers} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
