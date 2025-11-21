import { useState, useEffect } from 'react';
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
  List,
  ListItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CasinoIcon from '@mui/icons-material/Casino';
import { localStorageService, contentService } from '../../services';
import type { Abilities, ClassDefinition } from '../../types';
import { createEmptyCharacter } from '../../utils/characterFactory';
import {
  generateName,
  generateTraits,
  generateBody,
  generateHabit,
  generateAbilitiesFromClass,
  generateHPFromClass,
  generateOmensFromClass,
  generateSilverFromClass,
} from '../../utils/generators';
import { abilityScoreToModifier, formatModifier } from '../../utils/dice';

const steps = ['Choose Class', 'Generate Stats', 'Name & Details', 'Review'];

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [availableClasses, setAvailableClasses] = useState<ClassDefinition[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassDefinition | null>(null);
  const [name, setName] = useState('');
  const [abilities, setAbilities] = useState<Abilities | null>(null);
  const [maxHP, setMaxHP] = useState(0);
  const [maxOmens, setMaxOmens] = useState(0);
  const [silver, setSilver] = useState(0);
  const [traits, setTraits] = useState<string[]>([]);
  const [body, setBody] = useState('');
  const [habit, setHabit] = useState('');

  useEffect(() => {
    const classes = contentService.getClasses();
    setAvailableClasses(classes);
  }, []);

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

  const handleClassSelect = (classDef: ClassDefinition) => {
    setSelectedClass(classDef);
    handleNext();
  };

  const handleGenerateStats = () => {
    if (!selectedClass) return;

    const newAbilities = generateAbilitiesFromClass(selectedClass.id);
    const toughnessMod = abilityScoreToModifier(newAbilities.toughness);
    const hp = generateHPFromClass(selectedClass.id, toughnessMod);
    const omens = generateOmensFromClass(selectedClass.id);
    const startingSilver = generateSilverFromClass(selectedClass.id);

    setAbilities(newAbilities);
    setMaxHP(hp);
    setMaxOmens(omens);
    setSilver(startingSilver);
  };

  const handleManualAbility = (ability: keyof Abilities, value: number) => {
    if (!abilities || !selectedClass) return;
    const updated = { ...abilities, [ability]: value };
    setAbilities(updated);

    // Recalculate HP if toughness changed
    if (ability === 'toughness') {
      const toughnessMod = abilityScoreToModifier(value);
      const hp = generateHPFromClass(selectedClass.id, toughnessMod);
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
    if (!selectedClass || !abilities || !name.trim()) return;

    const character = createEmptyCharacter(selectedClass.id, name.trim());
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
            {availableClasses.map((classDef) => (
              <Card key={classDef.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {classDef.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {classDef.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Abilities:</strong> STR {classDef.abilityRolls.strength},
                    AGI {classDef.abilityRolls.agility},
                    PRE {classDef.abilityRolls.presence},
                    TGH {classDef.abilityRolls.toughness}
                  </Typography>
                  <Typography variant="body2">
                    <strong>HP:</strong> Toughness + {classDef.hitDie}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Omens:</strong> {classDef.startingOmens}
                  </Typography>
                  {classDef.specialAbilities.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Special Abilities:</strong>
                      </Typography>
                      <List dense>
                        {classDef.specialAbilities.map((ability, idx) => (
                          <ListItem key={idx} sx={{ pl: 0 }}>
                            <Typography variant="body2">
                              • <strong>{ability.name}:</strong> {ability.description}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {classDef.limitations && classDef.limitations.length > 0 && (
                    <Typography variant="body2" color="error">
                      <strong>Limitations:</strong> {classDef.limitations.join(', ')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button fullWidth onClick={() => handleClassSelect(classDef)}>
                    Select {classDef.name}
                  </Button>
                </CardActions>
              </Card>
            ))}
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
                  <Stack direction="row" spacing={1} flexWrap="wrap">
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

        {activeStep === 3 && abilities && selectedClass && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Review Character</Typography>

              <Box>
                <Typography variant="h5">{name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedClass.name}
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

              {selectedClass.specialAbilities.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Special Abilities:</Typography>
                  {selectedClass.specialAbilities.map((ability, idx) => (
                    <Typography key={idx} variant="body2">
                      • {ability.name}: {ability.description}
                    </Typography>
                  ))}
                </Box>
              )}

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
