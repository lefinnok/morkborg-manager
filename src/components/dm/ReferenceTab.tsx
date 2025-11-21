import {
  Box,
  Paper,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CasinoIcon from '@mui/icons-material/Casino';
import { useState } from 'react';
import { rollDice } from '../../utils/dice';
import { contentService } from '../../services';

export default function ReferenceTab() {
  const [randomName, setRandomName] = useState<string>('');
  const [randomTrait, setRandomTrait] = useState<string>('');
  const [randomBody, setRandomBody] = useState<string>('');
  const [randomHabit, setRandomHabit] = useState<string>('');

  const tables = contentService.getTables();

  const handleRollName = () => {
    const row = rollDice(6) - 1;
    const col = rollDice(8) - 1;
    setRandomName(tables.names[row][col]);
  };

  const handleRollTrait = () => {
    const index = rollDice(20) - 1;
    setRandomTrait(tables.terribleTraits[index]);
  };

  const handleRollBody = () => {
    const index = rollDice(20) - 1;
    setRandomBody(tables.brokenBodies[index]);
  };

  const handleRollHabit = () => {
    const index = rollDice(20) - 1;
    setRandomHabit(tables.badHabits[index]);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Quick Rules */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Rules Reference
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Core Mechanic
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roll d20 + ability modifier vs DR (usually 12)
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Combat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Attack: d20 + STR (melee) or AGI (ranged) vs DR12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Defend: d20 + AGI vs DR12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Damage: Roll weapon die, subtract armor DR
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Omens
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Spend an omen to reroll any d20 (yours or another's)
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Ability Modifiers */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ability Score Modifiers
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Score</TableCell>
                  <TableCell>Modifier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>1-4</TableCell>
                  <TableCell>-3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>5-6</TableCell>
                  <TableCell>-2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>7-8</TableCell>
                  <TableCell>-1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>9-12</TableCell>
                  <TableCell>0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>13-14</TableCell>
                  <TableCell>+1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>15-16</TableCell>
                  <TableCell>+2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>17-18</TableCell>
                  <TableCell>+3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>19-20</TableCell>
                  <TableCell>+4</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Random Tables */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Random Generators
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Random Name</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollName}
                >
                  Roll
                </Button>
              </Box>
              {randomName && (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="body2">{randomName}</Typography>
                </Paper>
              )}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Random Terrible Trait</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollTrait}
                >
                  Roll
                </Button>
              </Box>
              {randomTrait && (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="body2">{randomTrait}</Typography>
                </Paper>
              )}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Random Broken Body</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollBody}
                >
                  Roll
                </Button>
              </Box>
              {randomBody && (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="body2">{randomBody}</Typography>
                </Paper>
              )}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Random Bad Habit</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollHabit}
                >
                  Roll
                </Button>
              </Box>
              {randomHabit && (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="body2">{randomHabit}</Typography>
                </Paper>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Expandable Tables */}
        <Box>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Names Table (d6 × d8)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {tables.names.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((name, j) => (
                          <TableCell key={j}>{name}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Terrible Traits (d20)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {tables.terribleTraits.map((trait, i) => (
                  <Typography key={i} variant="body2">
                    {i + 1}. {trait}
                  </Typography>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Broken Bodies (d20)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {tables.brokenBodies.map((body, i) => (
                  <Typography key={i} variant="body2">
                    {i + 1}. {body}
                  </Typography>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Bad Habits (d20)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {tables.badHabits.map((habit, i) => (
                  <Typography key={i} variant="body2">
                    {i + 1}. {habit}
                  </Typography>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Stack>
    </Box>
  );
}
