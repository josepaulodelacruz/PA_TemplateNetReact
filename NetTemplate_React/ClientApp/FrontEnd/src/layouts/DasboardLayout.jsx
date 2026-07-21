import {
  Menu,
  AppShell,
  Burger,
  Badge,
  Group,
  ScrollArea,
  Space,
  Text,
  ThemeIcon,
  Avatar,
  UnstyledButton,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavItems } from '~/components/NavItems';
import { NavLink, useLocation, Outlet, useNavigate, ScrollRestoration, useNavigationType } from 'react-router';
import StringRoutes from '~/constants/StringRoutes';
import { BarChart, ChevronRight, HistoryIcon, LayoutDashboardIcon, LogOutIcon, WrenchIcon } from 'lucide-react';
import '../index.css';
import useAuth from '~/hooks/Auth/useAuth';
import { useEffect, useRef } from 'react';
import packageJson from '../../package.json';
import ThemeToggle from '~/components/ThemeToggle';

const DashboardLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { token, user, onSetClearToken } = useAuth();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const scrollPositions = useRef({});
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      // Save current scroll position
      scrollPositions.current[location.pathname] = window.scrollY;
    };

    // Add scroll listener to track positions
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    // Restore scroll position based on navigation type
    if (navigationType === 'POP') {
      // Browser back/forward - let ScrollRestoration handle it
      return;
    }

    // For PUSH navigation (clicking links)
    const savedPosition = scrollPositions.current[location.pathname];
    if (savedPosition !== undefined) {
      // Restore to last known position for this route
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 0);
    } else {
      // New route - scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  useEffect(() => {
    if (token === null) {
      navigate(StringRoutes.login);
    }
  }, [token, navigate])

  const handleLogout = () => {
    onSetClearToken();
  }

  const displayName = user?.fullName || user?.username || 'Default User';

  return (
    <AppShell
      header={{ height: 60, offset: true }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="lg"
    >
      <AppShell.Header withBorder>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Group gap="xs" visibleFrom="xs">
              <ThemeIcon
                variant="gradient"
                gradient={{ from: 'brand.7', to: 'brand.4', deg: 135 }}
                size="lg"
                radius="md"
              >
                <LayoutDashboardIcon size={18} />
              </ThemeIcon>
              <Text size="md" fw={700}>{packageJson.name}</Text>
              <Badge variant="light" size="sm" radius="sm">
                v{packageJson.version}
              </Badge>
            </Group>
          </Group>
          <Group gap="sm">
            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea}>
          <Space h="md" />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1} px="xl" pb="2xs">
            Overview
          </Text>
          <NavItems leftIcon={<LayoutDashboardIcon size={16} />} label="Dashboard" defaultOpened>
            <NavLink to={StringRoutes.dashboard} end>Dashboard</NavLink>
            <NavLink to={StringRoutes.feedback} end>HomeBuyer Feedback Form</NavLink>
          </NavItems>

          <Space h="sm" />
          <NavItems leftIcon={<WrenchIcon size={16} />} label="Setup">
            <NavLink to={StringRoutes.users}>Users</NavLink>
            <NavLink to={StringRoutes.modules}>Modules</NavLink>
          </NavItems>

          <Space h="sm" />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1} px="xl" pb="2xs">
            Analytics
          </Text>
          <NavItems leftIcon={<BarChart size={16} />} label="Reports">
            <NavLink to={StringRoutes.report_crash}>Crash Reports</NavLink>
          </NavItems>
          <Space h="md" />
        </AppShell.Section>

        <AppShell.Section p="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Menu position="top-end" width={200}>
            <Menu.Target>
              <UnstyledButton w="100%" p="2xs" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar color="brand" radius="xl" size="md" name={displayName} />
                    <Box>
                      <Text size="sm" fw={600} lineClamp={1}>{displayName}</Text>
                      <Text size="xs" c="dimmed">Signed in</Text>
                    </Box>
                  </Group>
                  <ChevronRight size={16} color="var(--mantine-color-dimmed)" />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<HistoryIcon size={16} />}>
                View History
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout} leftSection={<LogOutIcon size={16} />}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
        <ScrollRestoration />
      </AppShell.Main>
    </AppShell>
  );
}

export default DashboardLayout;
