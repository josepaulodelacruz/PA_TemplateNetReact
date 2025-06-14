import { Button, Container, Flex, Text, Group, Paper, Stack, ThemeIcon, Title, Space, Box, MultiSelect, Pagination, Loader } from "@mantine/core";
import { ArrowUp, Info } from "lucide-react";
import { useEffect, useState } from "react";
import CrashReportCard from "./components/CrashReportCard";
import CrashReportLineChart from "./components/CrashReportLineChart";
import useCrashReportFetch from "~/hooks/Reports/useCrashReportsFetch";
import ErrorElement from "~/components/ErrorElement";
import useCrashReport from "~/hooks/CrashReport/useCrashReport";
import { notificationWithCrashReportButton } from "~/utils/notification";
import { useLocation, useNavigate } from "react-router";
import useAuth from "~/hooks/Auth/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const PercentageColorIndicator = ({
  percentage
}) => {
  return (
    <Button size="compact-md" color="red" variant="light">
      <ArrowUp size={18} />
      <Text fw={900} size={13}>{percentage}</Text>
    </Button>
  )
}

const HeroCard = ({
  title = "",
  count = 0,
  percentage = null
}) => {
  return (
    <Paper w={'100%'} shadow="xs">
      <Stack>
        <Group>
          <Title size="lg">{title}</Title>
          <ThemeIcon color="white" variant="light" size="xs">
            <Info size={18} />
          </ThemeIcon>
        </Group>
        <Group>
          <Title size="h1">{count}</Title>
          {percentage && (
            <PercentageColorIndicator percentage={percentage} />
          )}
        </Group>
        <Text c="dimmed" size={"xs"}>
          Crashes up <Text inherit span c="red" fw={800}>12.32%</Text> since last month
        </Text>
      </Stack>
    </Paper>
  )
}

const CrashReportCardSection = ({
  filters = [],
  page = 1
}) => {
  const { data, isLoading, isError, error, refetch } = useCrashReportFetch(page, filters)
  const { onTriggerCrashReportModal } = useCrashReport();
  const { pathname } = useLocation()
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    refetch();
  }, [filters])

  useEffect(() => {
    if (isError) {
      notificationWithCrashReportButton({
        color: 'red',
        title: "Failed",
        message: error.message,
        onClick: () => {
          onTriggerCrashReportModal({
            error: error,
            pathname: pathname,
            userAgent: user.agent,
          });
        }
      })
    }
  }, [isError])

  if (isLoading) {
    return (
      <Group justify="center">
        <Loader type="dots" />
      </Group>
    )
  }

  if (isError) {
    return <ErrorElement >Something went wrong..</ErrorElement>
  }

  return (
    <Flex wrap="wrap" gap="md">
      {
        data?.body !== undefined && Array.isArray(data.body) && data.body?.map((report, index) => {
          return (
            <Box key={index} style={{ flexBasis: 'calc(25% - 12px)', minWidth: '300' }}>
              <CrashReportCard queryClient={queryClient} report={report} />
            </Box>
          )
        })
      }
    </Flex>
  )
}

const CrashReport = () => {
  const [range, setRange] = useState('today')
  const [page, onChange] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const { data, isSuccess } = useCrashReportFetch(page)
  const { onTriggerCrashReportModal, filterSeverity, setFilterSeverity } = useCrashReport();

  useEffect(() => {
    if (isSuccess) {
      setTotalPage(data?.body[0]?.total_pages);
    }
  }, [isSuccess, data])

  const handleFilterRange = (val) => {
    setRange(val);
  }

  const handleTestError = () => {
    try {
      onChange('test');
    } catch (err) {
      onTriggerCrashReportModal({
        pathname: pathname,
        userAgent: user.agent,
      });

    }
  }

  return (
    <Container fluid>
      <Group>
        <Title component={'span'} size={50} fw={700} >Crash Reports</Title>
      </Group>

      <Group justify="space-between">
        <Button.Group my={12} size="compact-xs">
          <Button onClick={() => handleFilterRange('today')} variant={range === 'today' ? 'light' : 'default'}>Today</Button>
          <Button onClick={() => handleFilterRange('yesterday')} variant={range === 'yesterday' ? 'light' : 'default'} >Yesterday</Button>
          <Button onClick={() => handleFilterRange('week')} variant={range === 'week' ? 'light' : 'default'}>Week</Button>
          <Button onClick={() => handleFilterRange('month')} variant={range === 'month' ? 'light' : 'default'} >Month</Button>
          <Button onClick={() => handleFilterRange('all')} variant={range === 'all' ? 'light' : 'default'} >All Time</Button>
        </Button.Group>
        <Button variant="outline" color="red" onClick={handleTestError}>
          Test error

        </Button>
      </Group>

      <Flex gap="lg" direction={{ base: 'column', md: 'row' }} >
        <Flex flex={1.2} gap="sm" direction="column">
          <Flex direction="row" gap="sm">
            <HeroCard title="Total Crashes" count={12} percentage="12.32%" />
            <HeroCard title="Affected Users" count={1} percentage="90%" />
          </Flex>
          <Flex direction="row" gap="sm" >
            <HeroCard title="Crash Free Sessions" count={1832}  />
            <HeroCard title="Critical System Failure" count={9}  />
          </Flex>
        </Flex>
        <Flex gap="sm" flex={2}>
          <CrashReportLineChart />
        </Flex>
      </Flex>

      <Space h={15} />

      <Group justify="start">
        <Box w={{ base: '100%', md: 400 }} py={20}>
          <MultiSelect
            clearable
            placeholder="Filter"
            onChange={setFilterSeverity}
            value={filterSeverity}
            data={['Low', 'Medium', 'High', 'Critical']}
            comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 }}
          />
        </Box>
      </Group>
      <CrashReportCardSection filters={filterSeverity} page={page} />
      <Group justify="end">
        <Box py={20}>
          <Pagination onChange={onChange} total={totalPage} boundaries={2} />
        </Box>
      </Group>
    </Container>
  )
}

export default CrashReport;
