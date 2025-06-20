import {
  Container,
  Grid,
  Group,
  Paper,
  Title,
  UnstyledButton,
  Stack,
  Text,
  Badge,
  Avatar,
  Divider,
  Box,
  Code,
  ScrollArea,
  Skeleton,
  Menu,
  Space,
  Card
} from "@mantine/core";
import { ArrowLeft, CheckIcon, ClipboardList, EllipsisVertical } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router";
import { useElementSize, useMediaQuery } from "@mantine/hooks";
import CrashReportTimelineCard from "./components/CrashReportTimelineCard";
import useCrashReportById from "~/hooks/CrashReport/useCrashReportById";
import moment from "moment";
import ErrorElement from "~/components/ErrorElement";
import useCrashReport from "~/hooks/CrashReport/useCrashReport";
import CrashReportImageCarousel from "./components/CrashReportImageCarousel";
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import useCrashReportFetchBackendLog from "~/hooks/CrashReport/useCrashReportFetchBackendLog";
import { useState } from "react";

const CrashReportView = () => {
  const { ref, height } = useElementSize();
  const { id } = useParams();
  const { imageCover } = useCrashReport();
  const { data: report, isLoading, isSuccess, isError } = useCrashReportById(id);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isShowBackendLog, setShowBackendLog] = useState(false);

  if (isSuccess && !isLoading && !report?.body) {
    return <ErrorElement>No report found</ErrorElement>;
  }

  if(isError) return <ErrorElement></ErrorElement>

  const _imageSrc = !imageCover ? report?.body?.image_bins[0] : imageCover;

  return (
    <Container fluid>
      <Group ref={ref}>
        <UnstyledButton
          component={Link}
          to=".."
          relative="path"
          viewTransition
          p={0}
          m={0}
        >
          <ArrowLeft />
        </UnstyledButton>
        <Title component={'span'} size={50} fw={700}>Crash Reports</Title>
      </Group>
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Container
            style={{ height: `calc(100vh - ${height + 95}px)` }}
            bg='#1C1C1C'
          >
            <CrashReportImageCarousel height={height} id={id} report={report} imageSrc={_imageSrc} />
          </Container>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          {
            isLoading ?
              <CrashSkeletonLoading height={height} isMobile={isMobile} /> :
              <CrashDetails
                height={height}
                isMobile={isMobile}
              >
                {/* User details */}
                <Group px={5} py={10}>
                  <Avatar alt="dp">AD</Avatar>
                  <Stack flex={1} justify="center" gap={0}>
                    <Title size="md" fw={600}>{report?.body?.created_by}</Title>
                    <Text size="xs" c="dimmed">{moment().calendar()}</Text>
                  </Stack>
                  {
                    <Menu
                      position="bottom-end"
                    >
                      <Menu.Target>
                        <EllipsisVertical />
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item disabled={isShowBackendLog} onClick={() => setShowBackendLog(true)} leftSection={<ClipboardList />}>
                          View Logs
                        </Menu.Item>
                        <Menu.Item leftSection={<CheckIcon color="green" />}>
                          Mark as resolved
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  }

                </Group>
                <Group px={10} py={0} gap="xs">
                  <Badge size="xs" variant="dot">{report?.body?.os}</Badge>
                  <Badge size="xs" variant="dot">{report?.body?.browser}</Badge>
                </Group>

                {/* Header post details */}
                <Container p={10}>
                  <Text size="sm" fw={300}>{report?.body?.details}</Text>
                </Container>

                <CrashReportTimelineCard
                  margin={10}
                  padding={0}
                  referenceId={report?.body?.log_id}
                  severity={report?.body?.severity_level}
                  errorDetails={{
                    when: report?.body?.when,
                    where: report?.body?.where,
                    what: report?.body?.what,
                    stackTrace: "",
                    userAgent: "",
                    email: "",
                    severityLevel: "",
                    details: "",
                    scenario: "",
                    error: {},
                  }}
                />

                <Box p={10}>
                  <Title size="md" fw={500}>Steps to reproduce</Title>
                  <Divider my={5} />
                  <Text fw={300} size="sm">{report?.body?.scenario}.</Text>
                </Box>

                <Box p={10}>
                  <Title size="md" fw={500}>Stack Trace</Title>
                  <Divider my={5} />
                  <Code block>{report?.body?.stack_trace}</Code>
                </Box>

                {isShowBackendLog && (
                  <CrashReportBackendLog
                    referenceId={report?.body?.log_id} />
                )}

              </CrashDetails>
          }

        </Grid.Col>
      </Grid>
    </Container>
  );
};

const CrashDetails = ({
  isMobile,
  children,
  height
}) => {

  return isMobile ? (
    <Paper w="100%"
      p={10} m={0}>
      {children}
    </Paper>
  ) : (
    <ScrollArea h={`calc(100vh - ${height + 95}px)`} w="100%">
      <Paper
        w="100%"
        // h={`calc(100vh - ${height + 95}px)`}
        p={10}
        m={0}
      >
        {children}
      </Paper>
    </ScrollArea>
  )
}

const CrashSkeletonLoading = ({ isMobile, height }) => {
  return (
    <Paper
      component={ScrollArea}
      h={isMobile ? '50vh' : `calc(100vh - ${height + 95}px)`}
      w={'100%'}
      p={10}
      m={0}
    >
      {/* User details skeleton */}
      <Group px={5} py={10}>
        <Skeleton height={40} circle />
        <Stack flex={1} justify="center" gap={5}>
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </Stack>
        <Skeleton height={20} width={60} radius="xl" />
      </Group>

      {/* Badges skeleton */}
      <Group px={10} py={0} gap="xs">
        <Skeleton height={20} width={50} radius="xl" />
        <Skeleton height={20} width={60} radius="xl" />
      </Group>

      {/* Details skeleton */}
      <Container p={10}>
        <Skeleton height={12} mb={5} />
        <Skeleton height={12} mb={5} />
        <Skeleton height={12} width="80%" />
      </Container>

      {/* Timeline card skeleton */}
      <Box p={10}>
        <Skeleton height={100} radius="md" />
      </Box>

      {/* Steps to reproduce skeleton */}
      <Box p={10}>
        <Skeleton height={18} width="50%" mb={10} />
        <Skeleton height={1} mb={10} />
        <Skeleton height={12} mb={5} />
        <Skeleton height={12} width="70%" />
      </Box>

      {/* Stack trace skeleton */}
      <Box p={10}>
        <Skeleton height={18} width="40%" mb={10} />
        <Skeleton height={1} mb={10} />
        <Skeleton height={80} radius="md" />
      </Box>
    </Paper>
  )
}

const CrashReportBackendLog = ({
  referenceId
}) => {
  const { data, isLoading, isError, error } = useCrashReportFetchBackendLog(referenceId);

  if (isLoading) {
    <Box p={10}>
      <Skeleton w={300} h={50} />
      <Divider my={5} />
      <Space h={10} />
    </Box>
  }

  return (
    <Box p={10}>
      <Title size="md" fw={500}>Backend Logs</Title>
      <Divider my={5} />
      <Space h={10} />

      {
        data?.body?.map((item, index) => {
          return (
            <div key={index}>
              <Group justify="space-between" >
                <div>
                  <Text component="span" fw={400} size="sm" >{item.requestMethod} {item.requestPath} <Text component="span" c="dimmed">{item.duration}ms</Text></Text>
                  <Text c="dimmed" size="xs">{moment(item.timestamp).calendar()}</Text>
                </div>
                <Badge size="xs" color="red">
                  400
                </Badge>
              </Group>

              <Card h={"100%"} mt={10} p={10} >
                <JsonView style={darkTheme} value={JSON.parse(item.body)} />
              </Card>
            </div>
          )
        })
      }
    </Box>
  )
}

export default CrashReportView;
