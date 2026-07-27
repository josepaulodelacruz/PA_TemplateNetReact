import { Button, Center, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ShieldXIcon } from 'lucide-react';
import { Link } from 'react-router';
import StringRoutes from '~/constants/StringRoutes';

const Forbidden = () => (
  <Center mih="60vh">
    <Stack align="center" gap="sm">
      <ThemeIcon variant="light" color="red" size={64} radius="xl">
        <ShieldXIcon size={32} />
      </ThemeIcon>
      <Title order={2}>Access denied</Title>
      <Text c="dimmed" ta="center" maw={360}>
        You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
      </Text>
      <Button component={Link} to={StringRoutes.dashboard} variant="light" mt="sm">
        Back to Dashboard
      </Button>
    </Stack>
  </Center>
);

export default Forbidden;
