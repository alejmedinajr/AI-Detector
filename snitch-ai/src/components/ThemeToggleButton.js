import React from 'react';
import { useColorMode, Button, IconButton } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';

// References:
// https://v2.chakra-ui.com/docs/styled-system/color-mode

const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
      isRound='true'
      size='md'
      alignSelf='flex-end'
      onClick={toggleColorMode}
      aria-label="Toggle theme"
    />
  );
};

export default ThemeToggleButton;
