import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CasinoIcon from '@mui/icons-material/Casino';
import { localStorageService } from '../../services';
import type { CharacterClass, Abilities } from '../../types';
import { createEmptyCharacter } from '../../utils/characterFactory';
import {
  generateName,
  generateTraits,
  generateBody,
  generateHabit,
  generateAbilities,
  generateHP,
  generateOmens,
  generateSilver,
} from '../../utils/generators';
import { abilityScoreToModifier, formatModifier } from '../../utils/dice';

const steps = ['Choose Class', 'Generate Stats', 'Name & Details', 'Review'];

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
  const [name, setName] = useState('');
  const [abilities, setAbilities] = useState<Abilities | null>(null);
  const [maxHP, setMaxHP] = useState(0);
  const [maxOmens, setMaxOmens] = useState(0);
  const [silver, setSilver] = useState(0);
  const [traits, setTraits] = useState<string[]>([]);
  const [body, setBody] = useState('');
  const [habit, setHabit] = useState('');

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/player');
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleClassSelect = (cls: CharacterClass) => {
    setCharacterClass(cls);
    handleNext();
  };

  const handleGenerateStats = () => {
    if (!characterClass) return;

    const newAbilities = generateAbilities(characterClass);
    const toughnessMod = abilityScoreToModifier(newAbilities.toughness);
    const hp = generateHP(characterClass, toughnessMod);
    const omens = generateOmens();
    const startingSilver = generateSilver();

    setAbilities(newAbilities);
    setMaxHP(hp);
    setMaxOmens(omens);
    setSilver(startingSilver);
  };

  const handleManualAbility = (ability: keyof Abilities, value: number) => {
    if (!abilities) return;
    const updated = { ...abilities, [ability]: value };
    setAbilities(updated);

    // Recalculate HP if toughness changed
    if (ability === 'toughness' && characterClass) {
      const toughnessMod = abilityScoreToModifier(value);
      const hp = generateHP(characterClass, toughnessMod);
      setMaxHP(hp);
    }
  };

  const handleGenerateFluff = () => {
    setName(generateName());
    setTraits(generateTraits());
    setBody(generateBody());
    setHabit(generateHabit());
  };

  const handleCreate = async () => {
    if (!characterClass || !abilities || !name.trim()) return;

    const character = createEmptyCharacter(characterClass, name.trim());
    character.abilities = abilities;
    character.hpOmens = {
      currentHP: maxHP,
      maxHP,
      currentOmens: maxOmens,
      maxOmens,
      currentPowers: 0,
      maxPowers: 0,
    };
    character.silver = silver;
    character.notes = `Traits: ${traits.join(', ')}\nBody: ${body}\nHabit: ${habit}`;

    await localStorageService.createCharacter(character);
    navigate(`/player/sheet/${character.id}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create Character
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Classless
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  A wretched soul with no special training
                </Typography>
                <Typography variant="body2">
                  <strong>Abilities:</strong> 3d6 each
                </Typography>
                <Typography variant="body2">
                  <strong>HP:</strong> Toughness + d8
                </Typography>
                <Typography variant="body2">
                  <strong>Omens:</strong> d2
                </Typography>
              </CardContent>
              <CardActions>
                <Button fullWidth onClick={() => handleClassSelect('classless')}>
                  Select
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fanged Deserter
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cursed with fangs, fled from former life
                </Typography>
                <Typography variant="body2">
                  <strong>Abilities:</strong> STR 3d6+2, AGI/PRE 3d6-1
                </Typography>
                <Typography variant="body2">
                  <strong>HP:</strong> Toughness + d10
                </Typography>
                <Typography variant="body2">
                  <strong>Special:</strong> Bite Attack (DR10, d6 damage)
                </Typography>
                <Typography variant="body2">
                  <strong>Limitation:</strong> Illiterate
                </Typography>
              </CardContent>
              <CardActions>
                <Button fullWidth onClick={() => handleClassSelect('fanged-deserter')}>
                  Select
                </Button>
              </CardActions>
            </Card>
          </Stack>
        )}

        {activeStep === 1 && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Ability Scores</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleGenerateStats}
                >
                  Roll Stats
                </Button>
              </Box>

              {abilities && (
                <>
                  <Stack spacing={2}>
                    {(['strength', 'agility', 'presence', 'toughness'] as const).map((ability) => (
                      <TextField
                        key={ability}
                        fullWidth
                        label={ability.charAt(0).toUpperCase() + ability.slice(1)}
                        type="number"
                        value={abilities[ability]}
                        onChange={(e) => handleManualAbility(ability, parseInt(e.target.value) || 0)}
                        helperText={`Modifier: ${formatModifier(abilityScoreToModifier(abilities[ability]))}`}
                      />
                    ))}
                  </Stack>

                  <Box>
                    <Typography variant="body1">
                      <strong>HP:</strong> {maxHP}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Omens:</strong> {maxOmens}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Silver:</strong> {silver}
                    </Typography>
                  </Box>

                  <Button variant="contained" onClick={handleNext} fullWidth>
                    Continue
                  </Button>
                </>
              )}

              {!abilities && (
                <Typography color="text.secondary" textAlign="center">
                  Click "Roll Stats" to generate ability scores
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

        {activeStep === 2 && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Character Details</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleGenerateFluff}
                >
                  Generate
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {traits.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Terrible Traits
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {traits.map((trait, i) => (
                      <Chip key={i} label={trait} />
                    ))}
                  </Stack>
                </Box>
              )}

              {body && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Broken Body
                  </Typography>
                  <Typography variant="body2">{body}</Typography>
                </Box>
              )}

              {habit && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Bad Habit
                  </Typography>
                  <Typography variant="body2">{habit}</Typography>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleNext}
                fullWidth
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </Stack>
          </Paper>
        )}

        {activeStep === 3 && abilities && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Review Character</Typography>

              <Box>
                <Typography variant="h5">{name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {characterClass === 'classless' ? 'Classless' : 'Fanged Deserter'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2">
                  <strong>STR:</strong> {abilities.strength} ({formatModifier(abilityScoreToModifier(abilities.strength))})
                </Typography>
                <Typography variant="body2">
                  <strong>AGI:</strong> {abilities.agility} ({formatModifier(abilityScoreToModifier(abilities.agility))})
                </Typography>
                <Typography variant="body2">
                  <strong>PRE:</strong> {abilities.presence} ({formatModifier(abilityScoreToModifier(abilities.presence))})
                </Typography>
                <Typography variant="body2">
                  <strong>TGH:</strong> {abilities.toughness} ({formatModifier(abilityScoreToModifier(abilities.toughness))})
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1">HP: {maxHP}</Typography>
                <Typography variant="body1">Omens: {maxOmens}</Typography>
                <Typography variant="body1">Silver: {silver}</Typography>
              </Box>

              {traits.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Traits:</Typography>
                  <Typography variant="body2">{traits.join(', ')}</Typography>
                </Box>
              )}

              {body && (
                <Box>
                  <Typography variant="subtitle2">Body:</Typography>
                  <Typography variant="body2">{body}</Typography>
                </Box>
              )}

              {habit && (
                <Box>
                  <Typography variant="subtitle2">Habit:</Typography>
                  <Typography variant="body2">{habit}</Typography>
                </Box>
              )}

              <Button variant="contained" onClick={handleCreate} fullWidth size="large">
                Create Character
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
