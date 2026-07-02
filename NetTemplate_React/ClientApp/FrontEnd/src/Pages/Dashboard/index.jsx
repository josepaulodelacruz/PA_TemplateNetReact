import {
  Badge,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import {
  ActivityIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BugIcon,
  PackageIcon,
  UsersIcon,
} from 'lucide-react';
import moment from 'moment';

const STATS = [
  {
    label: 'Total Users',
    value: '1,284',
    diff: 12.4,
    icon: UsersIcon,
    color: 'brand',
  },
  {
    label: 'Active Modules',
    value: '32',
    diff: 4.1,
    icon: PackageIcon,
    color: 'indigo',
  },
  {
    label: 'Crash Reports',
    value: '17',
    diff: -8.3,
    icon: BugIcon,
    color: 'red',
  },
  {
    label: 'System Uptime',
    value: '99.9%',
    diff: 0.2,
    icon: ActivityIcon,
    color: 'green',
  },
];

const ACTIVITY_DATA = [
  { date: 'Mon', Users: 320, Sessions: 480 },
  { date: 'Tue', Users: 410, Sessions: 590 },
  { date: 'Wed', Users: 380, Sessions: 520 },
  { date: 'Thu', Users: 470, Sessions: 680 },
  { date: 'Fri', Users: 520, Sessions: 740 },
  { date: 'Sat', Users: 290, Sessions: 380 },
  { date: 'Sun', Users: 260, Sessions: 340 },
];

const MODULE_USAGE = [
  { name: 'Setup', value: 42, color: 'brand.5' },
  { name: 'Reports', value: 28, color: 'indigo.5' },
  { name: 'Users', value: 18, color: 'cyan.5' },
  { name: 'Other', value: 12, color: 'gray.5' },
];

const RECENT_ACTIVITY = [
  { user: 'J. Dela Cruz', action: 'Updated module permissions', target: 'Setup / Modules', time: moment().subtract(8, 'minutes') },
  { user: 'A. Santos', action: 'Created a new user account', target: 'Setup / Users', time: moment().subtract(42, 'minutes') },
  { user: 'System', action: 'Crash report submitted', target: 'Reports / Crash', time: moment().subtract(2, 'hours') },
  { user: 'M. Reyes', action: 'Viewed user history', target: 'Setup / Users', time: moment().subtract(5, 'hours') },
  { user: 'J. Dela Cruz', action: 'Edited module configuration', target: 'Setup / Modules', time: moment().subtract(1, 'days') },
];

const StatCard = ({ label, value, diff, icon, color }) => {
  const Icon = icon;
  const isPositive = diff >= 0;
  const DiffIcon = isPositive ? ArrowUpRightIcon : ArrowDownRightIcon;

  return (
    <Card p="lg">
      <Group justify="space-between" align="flex-start">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
          {label}
        </Text>
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          <Icon size={18} />
        </ThemeIcon>
      </Group>
      <Group align="flex-end" gap="xs" mt="md">
        <Text fz="3xl" fw={700} lh={1}>
          {value}
        </Text>
        <Badge
          variant="light"
          color={isPositive ? 'teal' : 'red'}
          leftSection={<DiffIcon size={12} />}
          size="sm"
        >
          {Math.abs(diff)}%
        </Badge>
      </Group>
      <Text size="xs" c="dimmed" mt="2xs">
        Compared to last week
      </Text>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed" size="sm">
            Welcome back — here's what's happening today.
          </Text>
        </div>
        <Badge variant="default" size="lg" radius="md">
          {moment().format('dddd, MMM D YYYY')}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card p="lg" h="100%">
            <Group justify="space-between" mb="lg">
              <div>
                <Text fw={600}>Weekly Activity</Text>
                <Text size="xs" c="dimmed">Users and sessions over the past 7 days</Text>
              </div>
              <Badge variant="light">Last 7 days</Badge>
            </Group>
            <AreaChart
              h={280}
              data={ACTIVITY_DATA}
              dataKey="date"
              series={[
                { name: 'Users', color: 'brand.5' },
                { name: 'Sessions', color: 'indigo.5' },
              ]}
              curveType="monotone"
              withLegend
              legendProps={{ verticalAlign: 'bottom' }}
              fillOpacity={0.15}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card p="lg" h="100%">
            <div>
              <Text fw={600}>Module Usage</Text>
              <Text size="xs" c="dimmed">Distribution of activity by area</Text>
            </div>
            <Group justify="center" my="lg">
              <DonutChart
                data={MODULE_USAGE}
                thickness={26}
                size={180}
                paddingAngle={2}
                tooltipDataSource="segment"
                chartLabel="Usage"
              />
            </Group>
            <Stack gap="2xs">
              {MODULE_USAGE.map((item) => (
                <Group key={item.name} justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size={10} radius="xl" color={item.color} />
                    <Text size="sm">{item.name}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{item.value}%</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Card p="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600}>Recent Activity</Text>
            <Text size="xs" c="dimmed">Latest actions across the system</Text>
          </div>
        </Group>
        <Table.ScrollContainer minWidth={560}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Area</Table.Th>
                <Table.Th ta="right">When</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {RECENT_ACTIVITY.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td fw={500}>{item.user}</Table.Td>
                  <Table.Td>{item.action}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm" radius="sm">{item.target}</Badge>
                  </Table.Td>
                  <Table.Td ta="right" c="dimmed">{item.time.fromNow()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
};

export default Dashboard;
