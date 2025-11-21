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
  IconButton,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
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
  generateAbilityDetailed,
  generateHPDetailed,
  generateOmensDetailed,
  generateSilverDetailed,
  type GeneratorResult,
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

  // Roll dialog state
  const [rollDialogOpen, setRollDialogOpen] = useState(false);
  const [rollResult, setRollResult] = useState<GeneratorResult | null>(null);

  // Table dialog state for non-numeric rolls
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableContent, setTableContent] = useState<{ title: string; items: string[] }>({ title: '', items: [] });

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
    // Initialize all fields with NaN to show they need to be rolled/filled
    setAbilities({
      strength: NaN,
      agility: NaN,
      presence: NaN,
      toughness: NaN,
    });
    setMaxHP(NaN);
    setMaxOmens(NaN);
    setSilver(NaN);
    handleNext();
  };

  const handleRollAllStats = () => {
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

  const handleManualAbility = (ability: keyof Abilities, value: string) => {
    if (!abilities || !selectedClass) return;
    const numValue = value === '' ? NaN : parseInt(value);
    const updated = { ...abilities, [ability]: numValue };
    setAbilities(updated);

    // Recalculate or reset HP when toughness changes
    if (ability === 'toughness') {
      if (!isNaN(numValue)) {
        // Valid toughness: recalculate HP
        const toughnessMod = abilityScoreToModifier(numValue);
        const hp = generateHPFromClass(selectedClass.id, toughnessMod);
        setMaxHP(hp);
      } else {
        // Toughness cleared: reset HP to NaN
        setMaxHP(NaN);
      }
    }
  };

  // Individual roll handlers
  const handleRollAbility = (ability: keyof Abilities) => {
    if (!selectedClass) return;
    const result = generateAbilityDetailed(selectedClass.id, ability);
    setRollResult(result);
    setRollDialogOpen(true);
  };

  const handleAcceptRoll = () => {
    if (!rollResult) return;

    // Determine what was rolled based on description
    if (rollResult.description === 'Strength' || rollResult.description === 'Agility' ||
        rollResult.description === 'Presence' || rollResult.description === 'Toughness') {
      const abilityName = rollResult.description.toLowerCase() as keyof Abilities;
      if (!abilities) {
        setAbilities({
          strength: abilityName === 'strength' ? rollResult.value : NaN,
          agility: abilityName === 'agility' ? rollResult.value : NaN,
          presence: abilityName === 'presence' ? rollResult.value : NaN,
          toughness: abilityName === 'toughness' ? rollResult.value : NaN,
        });
      } else {
        handleManualAbility(abilityName, rollResult.value.toString());
      }
    } else if (rollResult.description === 'Hit Points') {
      setMaxHP(rollResult.value);
    } else if (rollResult.description === 'Omens') {
      setMaxOmens(rollResult.value);
    } else if (rollResult.description === 'Silver') {
      setSilver(rollResult.value);
    }

    setRollDialogOpen(false);
  };

  const handleRollHP = () => {
    if (!selectedClass || !abilities) return;
    const toughnessMod = abilityScoreToModifier(abilities.toughness);
    const result = generateHPDetailed(selectedClass.id, toughnessMod);
    setRollResult(result);
    setRollDialogOpen(true);
  };

  const handleRollOmens = () => {
    if (!selectedClass) return;
    const result = generateOmensDetailed(selectedClass.id);
    setRollResult(result);
    setRollDialogOpen(true);
  };

  const handleRollSilver = () => {
    if (!selectedClass) return;
    const result = generateSilverDetailed(selectedClass.id);
    setRollResult(result);
    setRollDialogOpen(true);
  };

  const handleReroll = () => {
    if (!rollResult) return;

    // Re-execute the same roll
    if (rollResult.description === 'Strength') handleRollAbility('strength');
    else if (rollResult.description === 'Agility') handleRollAbility('agility');
    else if (rollResult.description === 'Presence') handleRollAbility('presence');
    else if (rollResult.description === 'Toughness') handleRollAbility('toughness');
    else if (rollResult.description === 'Hit Points') handleRollHP();
    else if (rollResult.description === 'Omens') handleRollOmens();
    else if (rollResult.description === 'Silver') handleRollSilver();
  };

  const handleGenerateFluff = () => {
    setName(generateName());
    setTraits(generateTraits());
    setBody(generateBody());
    setHabit(generateHabit());
  };

  const handleRollName = () => {
    const tables = contentService.getTables();
    const newName = generateName();
    setName(newName);
    // Show the name table
    const allNames = tables.names.flat();
    setTableContent({ title: 'Name Table (d6 × d8)', items: allNames });
    setTableDialogOpen(true);
  };

  const handleRollTraits = () => {
    const tables = contentService.getTables();
    const newTraits = generateTraits();
    setTraits(newTraits);
    // Show the traits table
    setTableContent({ title: 'Terrible Traits (d20, roll twice)', items: tables.terribleTraits });
    setTableDialogOpen(true);
  };

  const handleRollBody = () => {
    const tables = contentService.getTables();
    const newBody = generateBody();
    setBody(newBody);
    // Show the body table
    setTableContent({ title: 'Broken Bodies (d20)', items: tables.brokenBodies });
    setTableDialogOpen(true);
  };

  const handleRollHabit = () => {
    const tables = contentService.getTables();
    const newHabit = generateHabit();
    setHabit(newHabit);
    // Show the habit table
    setTableContent({ title: 'Bad Habits (d20)', items: tables.badHabits });
    setTableDialogOpen(true);
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
                <Typography variant="h6">Generate Character Stats</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollAllStats}
                  size="small"
                >
                  Roll All
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Roll each stat individually, or use "Roll All" to generate everything at once.
              </Typography>

              {abilities && (
                <>
                  <Stack spacing={2}>
                    {(['strength', 'agility', 'presence', 'toughness'] as const).map((ability) => (
                      <Box key={ability}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <TextField
                            fullWidth
                            label={ability.charAt(0).toUpperCase() + ability.slice(1)}
                            type="number"
                            value={isNaN(abilities[ability]) ? '' : abilities[ability]}
                            onChange={(e) => handleManualAbility(ability, e.target.value)}
                            helperText={
                              isNaN(abilities[ability])
                                ? 'Roll or enter manually'
                                : `Modifier: ${formatModifier(abilityScoreToModifier(abilities[ability]))}`
                            }
                            placeholder="Roll or enter value"
                            error={isNaN(abilities[ability])}
                          />
                          <IconButton
                            color="primary"
                            onClick={() => handleRollAbility(ability)}
                            sx={{ mt: 1 }}
                            title={`Roll ${ability}`}
                          >
                            <CasinoIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          label="Max HP"
                          type="number"
                          value={isNaN(maxHP) ? '' : maxHP}
                          onChange={(e) => setMaxHP(e.target.value === '' ? NaN : parseInt(e.target.value))}
                          helperText={isNaN(maxHP) ? 'Roll or enter manually' : 'Hit Points'}
                          placeholder="Roll or enter value"
                          inputProps={{ min: 1 }}
                          error={isNaN(maxHP)}
                        />
                        <IconButton
                          color="primary"
                          onClick={handleRollHP}
                          sx={{ mt: 1 }}
                          title="Roll HP"
                          disabled={!abilities || isNaN(abilities.toughness)}
                        >
                          <CasinoIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          label="Max Omens"
                          type="number"
                          value={isNaN(maxOmens) ? '' : maxOmens}
                          onChange={(e) => setMaxOmens(e.target.value === '' ? NaN : parseInt(e.target.value))}
                          helperText={isNaN(maxOmens) ? 'Roll or enter manually' : 'Omens'}
                          placeholder="Roll or enter value"
                          inputProps={{ min: 0 }}
                          error={isNaN(maxOmens)}
                        />
                        <IconButton
                          color="primary"
                          onClick={handleRollOmens}
                          sx={{ mt: 1 }}
                          title="Roll Omens"
                        >
                          <CasinoIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          label="Starting Silver"
                          type="number"
                          value={isNaN(silver) ? '' : silver}
                          onChange={(e) => setSilver(e.target.value === '' ? NaN : parseInt(e.target.value))}
                          helperText={isNaN(silver) ? 'Roll or enter manually' : 'Silver coins'}
                          placeholder="Roll or enter value"
                          inputProps={{ min: 0 }}
                          error={isNaN(silver)}
                        />
                        <IconButton
                          color="primary"
                          onClick={handleRollSilver}
                          sx={{ mt: 1 }}
                          title="Roll Silver"
                        >
                          <CasinoIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={handleNext}
                    fullWidth
                    disabled={
                      !abilities ||
                      isNaN(abilities.strength) ||
                      isNaN(abilities.agility) ||
                      isNaN(abilities.presence) ||
                      isNaN(abilities.toughness) ||
                      isNaN(maxHP) ||
                      isNaN(maxOmens) ||
                      isNaN(silver)
                    }
                  >
                    Continue
                  </Button>
                </>
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

              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <IconButton
                    color="primary"
                    onClick={handleRollName}
                    sx={{ mt: 1 }}
                    title="Roll Name"
                  >
                    <CasinoIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Terrible Traits"
                    value={traits.join(', ')}
                    onChange={(e) => setTraits(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                    helperText="Comma-separated traits"
                    multiline
                    rows={2}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleRollTraits}
                    sx={{ mt: 1 }}
                    title="Roll Traits"
                  >
                    <CasinoIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Broken Body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    helperText="Physical description or affliction"
                  />
                  <IconButton
                    color="primary"
                    onClick={handleRollBody}
                    sx={{ mt: 1 }}
                    title="Roll Body"
                  >
                    <CasinoIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Bad Habit"
                    value={habit}
                    onChange={(e) => setHabit(e.target.value)}
                    helperText="Character's vice or quirk"
                  />
                  <IconButton
                    color="primary"
                    onClick={handleRollHabit}
                    sx={{ mt: 1 }}
                    title="Roll Habit"
                  >
                    <CasinoIcon />
                  </IconButton>
                </Box>
              </Box>

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

        {/* Dice Roll Result Dialog */}
        <Dialog open={rollDialogOpen} onClose={() => setRollDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{rollResult?.description}</DialogTitle>
          <DialogContent>
            {rollResult && (
              <Stack spacing={2}>
                <Typography variant="h3" textAlign="center" color="primary">
                  {rollResult.value}
                </Typography>

                {rollResult.rolls.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Roll Breakdown:
                    </Typography>
                    {rollResult.rolls.map((roll, idx) => (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{roll.notation}:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', my: 0.5 }}>
                          {roll.rolls.map((r, i) => (
                            <Chip
                              key={i}
                              label={r}
                              size="small"
                              color={r === roll.sides ? 'success' : r === 1 ? 'error' : 'default'}
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Sum: {roll.subtotal}
                          {roll.modifier !== 0 && ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier} = ${roll.total}`}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                  Formula: {rollResult.formula}
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRollDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReroll} startIcon={<CasinoIcon />}>
              Reroll
            </Button>
            <Button onClick={handleAcceptRoll} variant="contained">
              Accept
            </Button>
          </DialogActions>
        </Dialog>

        {/* Table Display Dialog */}
        <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{tableContent.title}</DialogTitle>
          <DialogContent>
            <List dense>
              {tableContent.items.map((item, idx) => (
                <ListItem key={idx}>
                  <Typography variant="body2">
                    <strong>{idx + 1}.</strong> {item}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTableDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
