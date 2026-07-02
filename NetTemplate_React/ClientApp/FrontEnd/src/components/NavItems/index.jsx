import {
  Group,
  Text,
  Collapse,
  Box,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import './index.css';
import { ChevronRight } from 'lucide-react';

const NavItems = ({
  leftIcon = null,
  label = "",
  children = null,
  defaultOpened = false,
}) => {
  const [opened, { toggle }] = useDisclosure(defaultOpened);

  return (
    <Box>
      <Group className='nav-item-container' align='center' justify='space-between' onClick={toggle}>
        <Group gap="sm" align='center'>
          <ThemeIcon variant='light' size="md" radius="md">
            <Center>
              {leftIcon}
            </Center>
          </ThemeIcon>
          <Text size='sm' fw={500}>
            {label}
          </Text>
        </Group>
        {
          children && (
            <ChevronRight
              className={`nav-item-chevron ${opened ? 'nav-item-chevron-opened' : ''}`}
              size={14}
            />
          )
        }
      </Group>
      <Collapse className='nav-collapsible-items-container' in={opened}>
        {children}
      </Collapse>
    </Box>
  )
}

export {
  NavItems,
}
