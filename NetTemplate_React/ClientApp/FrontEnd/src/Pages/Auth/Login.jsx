import {
  Button,
  Text,
  Title,
  Group,
  Flex,
  TextInput,
  PasswordInput,
  Checkbox,
  Divider,
  Box,
  Paper,
  Stack,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { LayoutDashboardIcon, LockIcon, Mail, PhoneCall, ShieldCheckIcon, ZapIcon, PaletteIcon } from "lucide-react";
import useLoginMutation from "~/hooks/Auth/useLoginMutation";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import useAuth from "~/hooks/Auth/useAuth";
import { useNavigate } from "react-router";
import StringRoutes from "~/constants/StringRoutes";
import packageJson from '../../../package.json';
import ThemeToggle from "~/components/ThemeToggle";

const FEATURES = [
  { icon: ZapIcon, label: 'Fast, modern dashboard built with React and Mantine' },
  { icon: ShieldCheckIcon, label: 'Role-based permissions and user management' },
  { icon: PaletteIcon, label: 'Light and dark themes out of the box' },
];

const Login = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      username: (value) => (value.length < 0 ? 'Required input' : null),
      password: (value) => (value.length < 0 ? 'Required input' : null),
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const loginMutation = useLoginMutation();
  const { onSetUserDetails } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = form.validate();

    if (valid) onManageLogin();
  }

  const onManageLogin = () => {
    navigate(StringRoutes.dashboard);
    // setIsLoading(true);
    // loginMutation.mutate(form.getValues(), {
    //   onSuccess: (response) => {
    //     setIsLoading(false);
    //     onSetUserDetails(response.data.body, response.data.body.token)
    //     notifications.show({
    //       color: 'green',
    //       title: "Success",
    //       message: "Please wait to redirect you to the dashboard"
    //     });
    //
    //     setTimeout(() => {
    //       navigate(StringRoutes.dashboard);
    //     }, 1000)
    //   },
    //   onError: (error) => {
    //     setIsLoading(false);
    //     const errorMessage = error.response?.data?.message || error.message;
    //     notifications.show({
    //       color: 'red',
    //       title: "Failed Login Attempt",
    //       message: errorMessage
    //     })
    //   }
    // })
  }

  return (
    <Flex h="100vh">
      {/* Brand panel */}
      <Box
        visibleFrom="md"
        w="45%"
        p="3xl"
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-brand-9) 0%, var(--mantine-color-brand-7) 60%, var(--mantine-color-brand-5) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Group gap="sm">
          <ThemeIcon variant="white" size="lg" radius="md" c="brand.8">
            <LayoutDashboardIcon size={20} />
          </ThemeIcon>
          <Text c="white" fw={700} size="lg">{packageJson.name}</Text>
        </Group>

        <Stack gap="lg">
          <Title c="white" order={1} fw={800} lh={1.15}>
            Manage everything from one clean workspace.
          </Title>
          <Stack gap="sm">
            {FEATURES.map((feature) => (
              <Group key={feature.label} gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="white" radius="xl" size="md" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <feature.icon size={14} />
                </ThemeIcon>
                <Text c="white" size="sm" opacity={0.9}>{feature.label}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Text c="white" size="xs" opacity={0.7}>
          © {new Date().getFullYear()} {packageJson.name} — v{packageJson.version}
        </Text>
      </Box>

      {/* Form panel */}
      <Flex flex={1} direction="column" align="center" justify="center" p="lg" pos="relative">
        <Box pos="absolute" top={16} right={16}>
          <ThemeToggle />
        </Box>

        <Box w="100%" maw={440}>
          <Group justify="center" gap="xs" mb="lg" hiddenFrom="md">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: 'brand.7', to: 'brand.4', deg: 135 }}
              size="lg"
              radius="md"
            >
              <LayoutDashboardIcon size={18} />
            </ThemeIcon>
            <Text fw={700} size="lg">{packageJson.name}</Text>
            <Badge variant="light" size="sm" radius="sm">v{packageJson.version}</Badge>
          </Group>

          <Stack gap={4} mb="xl" align="center">
            <Title order={1} fw={800}>Welcome back</Title>
            <Text c="dimmed" size="sm">Sign in using your account to continue.</Text>
          </Stack>

          <Paper p="xl" radius="lg">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  withAsterisk
                  size="md"
                  leftSection={<Mail size={18} />}
                  label="Username"
                  placeholder="Enter your username"
                  key={form.key('username')}
                  {...form.getInputProps('username')}
                />

                <PasswordInput
                  withAsterisk
                  size="md"
                  leftSection={<LockIcon size={18} />}
                  label="Password"
                  placeholder="Enter your password"
                  key={form.key('password')}
                  {...form.getInputProps('password')}
                />

                <Checkbox
                  key={form.key('rememberMe')}
                  {...form.getInputProps('rememberMe')}
                  label="Remember me"
                />

                <Button
                  loading={isLoading}
                  type="submit"
                  fullWidth
                  size="md"
                >
                  Sign in
                </Button>
              </Stack>
            </form>

            <Divider my="lg" label="Don't have an account?" labelPosition="center" />

            <Button fullWidth leftSection={<PhoneCall size={18} />} variant="light" size="md">
              Request Access to IT
            </Button>
          </Paper>
        </Box>
      </Flex>
    </Flex>
  )
}


export default Login;
