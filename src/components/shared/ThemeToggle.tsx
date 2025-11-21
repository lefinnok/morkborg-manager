import { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeModeContext } from '../../App';

export default function ThemeToggle() {
  const { toggleThemeMode, mode } = useContext(ThemeModeContext);

  return (
    <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
      <IconButton onClick={toggleThemeMode} color="inherit">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}
