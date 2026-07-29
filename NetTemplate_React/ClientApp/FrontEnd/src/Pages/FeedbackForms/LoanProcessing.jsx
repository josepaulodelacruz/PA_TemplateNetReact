import { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Title,
  Text,
  Breadcrumbs,
  Anchor,
  Group,
  Rating,
  Stack,
  TextInput,
  Select,
  Card,
  Table,
  Badge,
  ThemeIcon,
  ScrollArea,
  Skeleton,
  Alert,
  Modal,
  Textarea,
  Button,
  Drawer,
  Timeline,
  Divider,
  Menu,
  ActionIcon,
} from '@mantine/core'
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import StringRoutes from '~/constants/StringRoutes';
import { Link } from 'react-router'
import {
  ChevronRight,
  SearchIcon,
  LandmarkIcon,
  AlertCircleIcon,
  HelpCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  ListFilterIcon,
  CheckIcon,
} from 'lucide-react'
import moment from 'moment'
import useFeedbackLoanProcessing from '~/hooks/HomeBuyerFeedback/useFeedbackLoanProcessing';
import useFeedbackLoanProcessingManageMutation from '~/hooks/HomeBuyerFeedback/useFeedbackLoanProcessingManageMutation';
import usePermissions from '~/hooks/Auth/usePermissions';
import ModuleNames from '~/constants/ModuleNames';
import useFeedbackLoanProcessingQuestions from '~/hooks/HomeBuyerFeedback/useFeedbackLoanProcessingQuestions';
import useFeedbackActionTakenStage from '~/hooks/HomeBuyerFeedback/useFeedbackActionTakenStage';
import useFeedbackLoanProcessingThreads from '~/hooks/HomeBuyerFeedback/useFeedbackLoanProcessingThreads';
import {
  scoreFill,
  excelCell,
  excelHeader,
  excelRowNumber,
  excelTextCell,
} from './excelStyles';
import { stageTitle, stageFill } from './stageUtils';
import exportToExcel, { scoreExcelFill, stageExcelFill } from './exportToExcel';

const SCORE_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

const Q7_FILTER_OPTIONS = [
  { value: 'all', label: 'Show all' },
  { value: 'with', label: 'With comments' },
  { value: 'empty', label: 'Empty comments' },
];

const hasScore = (row, star) =>
  SCORE_KEYS.some((key) => Number(row[key]) === star);

const FilterSection = ({ search, onSearch, status, onStatus, rating, onRating, stageOptions }) => {
  return (
    <Group align="flex-end" gap="sm" wrap="wrap">
      <TextInput
        w={{ base: '100%', sm: 260 }}
        label="Search"
        placeholder="Search name, project, block, lot..."
        leftSection={<SearchIcon size={16} />}
        value={search}
        onChange={(event) => onSearch(event.currentTarget.value)}
        styles={{ label: { fontSize: '0.8rem' } }}
      />
      <Select
        w={160}
        label="Status"
        placeholder="All"
        clearable
        data={stageOptions}
        value={status}
        onChange={onStatus}
        styles={{ label: { fontSize: '0.8rem' } }}
      />
      <div>
        <Group gap={8} mb={4} align="center">
          <Text c="dimmed" size="xs" fw={500}>Filter by star rating</Text>
          {rating > 0 && (
            <Anchor component="button" type="button" size="xs" onClick={() => onRating(0)}>
              Clear
            </Anchor>
          )}
        </Group>
        <Rating value={rating} onChange={(value) => onRating(value === rating ? 0 : value)} />
      </div>
    </Group>
  );
}

const QuestionsModal = ({ opened, onClose }) => {
  const questions = useFeedbackLoanProcessingQuestions();
  const items = questions.data?.body ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <Text fw={600}>Survey Questions</Text>
          <Text size="xs" c="dimmed">Loan processing questionnaire</Text>
        </div>
      }
    >
      {questions.isLoading && (
        <Stack gap="sm">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} h={40} radius="sm" />
          ))}
        </Stack>
      )}

      {questions.isError && (
        <Alert
          variant="light"
          color="red"
          icon={<AlertCircleIcon size={18} />}
          title="Unable to load questions"
        >
          Something went wrong while fetching the questionnaire. Please try again later.
        </Alert>
      )}

      {!questions.isLoading && !questions.isError && (
        <Stack gap="sm">
          {items.map((item) => (
            <Group key={item.question_id.trim()} align="flex-start" wrap="nowrap" gap="sm">
              <Badge variant="light" color="indigo" size="lg" miw={44}>
                {item.question_id.trim()}
              </Badge>
              <Text size="sm" style={{ flex: 1, whiteSpace: 'pre-line' }}>
                {item.question.trim()}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Modal>
  );
};

const THREAD_STATUS_META = {
  DONE: { color: 'teal', icon: CheckCircle2Icon },
  ONGOING: { color: 'yellow', icon: ClockIcon },
};

const ThreadTimeline = ({ responseId }) => {
  const threads = useFeedbackLoanProcessingThreads(responseId);
  const items = threads.data?.body ?? [];

  if (threads.isLoading) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} h={72} radius="md" />
        ))}
      </Stack>
    );
  }

  if (threads.isError) {
    return (
      <Alert
        variant="light"
        color="red"
        icon={<AlertCircleIcon size={18} />}
        title="Unable to load history"
      >
        Something went wrong while fetching the thread history.
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="lg">
        No history yet — add the first update below.
      </Text>
    );
  }

  return (
    <Timeline active={items.length - 1} bulletSize={22} lineWidth={2}>
      {items.map((thread) => {
        const meta = THREAD_STATUS_META[thread.status_description] ?? { color: 'gray', icon: ClockIcon };
        const Icon = meta.icon;
        return (
          <Timeline.Item
            key={thread.id}
            color={meta.color}
            bullet={<Icon size={12} />}
            title={
              <Group gap="xs">
                <Badge variant="light" color={meta.color} size="sm">
                  {thread.status_description}
                </Badge>
                <Text size="xs" c="dimmed">
                  {moment(thread.created_date).format('MMM D, YYYY • h:mm A')}
                </Text>
              </Group>
            }
          >
            <Stack gap={6} mt={4}>
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.4}>Concern</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{thread.concern}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.4}>Action Taken</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{thread.action_taken}</Text>
              </div>
              <Text size="xs" c="dimmed">
                by {thread.name || thread.created_by} • {moment(thread.created_date).fromNow()}
              </Text>
            </Stack>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

const ManageResponseDrawer = ({ row, opened, onClose }) => {
  const manageMutation = useFeedbackLoanProcessingManageMutation();
  const { canUpdate } = usePermissions();
  const allowUpdate = canUpdate(ModuleNames.homeBuyerFeedback);
  const stagesQuery = useFeedbackActionTakenStage();
  const stages = stagesQuery.data?.body ?? [];

  const form = useForm({
    initialValues: {
      concern: '',
      action_taken: '',
      status: null,
    },
    validate: {
      concern: (value) => (value.trim() ? null : 'Concern is required'),
      action_taken: (value) => (value.trim() ? null : 'Action taken is required'),
      status: (value) => (value ? null : 'Status is required'),
    },
  });

  // Each save starts a new thread entry, so the form opens blank;
  // previous entries are shown in the history timeline above.
  useEffect(() => {
    if (row) form.reset();
  }, [row]);

  const handleSubmit = async (values) => {
    await manageMutation.mutateAsync(
      {
        response_id: row.id,
        concern: values.concern,
        action_taken: values.action_taken,
        status: values.status ? Number(values.status) : null,
      },
      {
        onSuccess: (response) => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: response.message,
          });
          form.reset();
        },
        onError: (error) => {
          notifications.show({
            color: 'red',
            title: 'Ooops',
            message: error.message,
          });
        },
      }
    );
  };

  const location = [row?.project, row?.block && `Blk ${row.block}`, row?.lot && `Lot ${row.lot}`]
    .filter(Boolean)
    .join(' • ');

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <div>
          <Text fw={600}>Manage Response</Text>
          <Text size="xs" c="dimmed">
            {[row?.buyers_name, location].filter(Boolean).join(' — ')}
          </Text>
        </div>
      }
    >
      <Stack gap="lg">


        {allowUpdate && (
          <>
            <Divider label="New update" labelPosition="center" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Textarea
                  label="Concern"
                  placeholder="Enter the buyer's concern"
                  withAsterisk
                  autosize
                  minRows={2}
                  maxRows={5}
                  {...form.getInputProps('concern')}
                />
                <Textarea
                  label="Action Taken"
                  placeholder="Describe the action taken to address the concern"
                  withAsterisk
                  autosize
                  minRows={3}
                  maxRows={6}
                  {...form.getInputProps('action_taken')}
                />
                <Select
                  label="Status"
                  placeholder={stagesQuery.isLoading ? 'Loading statuses...' : 'Select status'}
                  withAsterisk
                  data={stages.map((stage) => ({
                    value: String(stage.id),
                    label: `${stage.title} — ${stage.description}`,
                  }))}
                  {...form.getInputProps('status')}
                />
                <Group justify="flex-end" mt="xs">
                  <Button variant="subtle" color="gray" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    type="submit"
                    loading={manageMutation.isPending}
                    loaderProps={{ type: 'dots' }}
                  >
                    Save
                  </Button>
                </Group>
              </Stack>
            </form>
          </>
        )}
        <div>
          <Text size="sm" fw={600} mb="sm">History</Text>
          <ThreadTimeline responseId={row?.id} />
        </div>
      </Stack>
    </Drawer>
  );
};

const EmptyCellHint = () => (
  <Text size="xs" c="dimmed" fs="italic">Click to add</Text>
);

const ColumnCommentFilter = ({ value, onChange, label }) => {
  const active = value !== 'all';
  return (
    <Menu shadow="md" width={190} position="bottom-start" withArrow>
      <Menu.Target>
        <ActionIcon
          variant={active ? 'filled' : 'subtle'}
          color={active ? 'indigo' : 'gray'}
          size="sm"
          radius="sm"
          title={`Filter ${label} comments`}
          onClick={(event) => event.stopPropagation()}
        >
          <ListFilterIcon size={14} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
        <Menu.Label>Filter {label} comments</Menu.Label>
        {Q7_FILTER_OPTIONS.map((option) => (
          <Menu.Item
            key={option.value}
            leftSection={
              value === option.value ? <CheckIcon size={14} /> : <span style={{ width: 14 }} />
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

const LoanProcessingTable = ({ rows, stages, onManage, q7Filter, onQ7Filter }) => {
  const body = rows.map((row, index) => {
    const statusTitle = stageTitle(row.status, stages);
    return (
      <Table.Tr key={row.id}>
        <Table.Td style={excelRowNumber}>{index + 1}</Table.Td>
        <Table.Td style={excelCell}>{row.project}</Table.Td>
        <Table.Td style={{ ...excelCell, textAlign: 'center' }}>{row.block}</Table.Td>
        <Table.Td style={{ ...excelCell, textAlign: 'center' }}>{row.lot}</Table.Td>
        <Table.Td style={excelCell}>{row.buyers_name}</Table.Td>
        {SCORE_KEYS.map((key) => (
          <Table.Td
            key={key}
            style={{ ...excelCell, ...scoreFill(Number(row[key])), textAlign: 'center', fontWeight: 600 }}
          >
            {row[key]}
          </Table.Td>
        ))}
        <Table.Td style={excelTextCell}>{row.q7}</Table.Td>
        <Table.Td
          style={{ ...excelTextCell, cursor: 'pointer' }}
          title="Click to manage this response"
          onClick={() => onManage(row)}
        >
          {row.concern || <EmptyCellHint />}
        </Table.Td>
        <Table.Td
          style={{ ...excelTextCell, cursor: 'pointer' }}
          title="Click to manage this response"
          onClick={() => onManage(row)}
        >
          {row.action_taken || <EmptyCellHint />}
        </Table.Td>
        <Table.Td
          style={{
            ...excelCell,
            ...stageFill(statusTitle),
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {statusTitle}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table
      stickyHeader
      striped
      withTableBorder
      highlightOnHover
      style={{ borderCollapse: 'collapse' }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={excelRowNumber} />
          <Table.Th style={{ ...excelHeader, minWidth: 140 }}>Project</Table.Th>
          <Table.Th style={excelHeader}>Blk</Table.Th>
          <Table.Th style={excelHeader}>Lot</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 220 }}>Buyer's Name</Table.Th>
          {SCORE_KEYS.map((key, i) => (
            <Table.Th key={key} style={{ ...excelHeader, width: 40 }}>Q{i + 1}</Table.Th>
          ))}
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>
            <Group gap={6} wrap="nowrap" justify="space-between">
              <span>Q7</span>
              <ColumnCommentFilter value={q7Filter} onChange={onQ7Filter} label="Q7" />
            </Group>
          </Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>Concern</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>Action Taken</Table.Th>
          <Table.Th style={excelHeader}>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {body.length > 0 ? body : (
          <Table.Tr>
            <Table.Td colSpan={15} style={{ ...excelCell, textAlign: 'center' }}>
              <Text size="sm" c="dimmed" py="lg">No responses found</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  )
}

const LoanProcessing = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [q7Filter, setQ7Filter] = useState('all');
  const [selectedRow, setSelectedRow] = useState(null);
  const [questionsOpened, setQuestionsOpened] = useState(false);

  const loanProcessing = useFeedbackLoanProcessing();
  const responses = loanProcessing.data?.body ?? [];

  const stagesQuery = useFeedbackActionTakenStage();
  const stages = stagesQuery.data?.body ?? [];
  const stageOptions = [...stages.map((stage) => stage.title), 'Pending'];

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return responses.filter((row) => {
      if (query) {
        const haystack = [row.project, row.phase, row.block, row.lot, row.buyers_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (status) {
        const title = stageTitle(row.status, stages) ?? 'Pending';
        if (title !== status) return false;
      }
      if (rating > 0 && !hasScore(row, rating)) return false;
      if (q7Filter !== 'all') {
        const hasComment = String(row.q7 ?? '').trim().length > 0;
        if (q7Filter === 'with' && !hasComment) return false;
        if (q7Filter === 'empty' && hasComment) return false;
      }
      return true;
    });
  }, [responses, search, status, rating, q7Filter, stagesQuery.data]);

  const items = [
    { title: "HomeBuyer Feedback", href: StringRoutes.feedback },
    { title: "Loan Processing", href: null },
  ].map((item, index) => (
    <Anchor
      key={index}
      size="xs"
      component={Link}
      to={item.href}
      c={item.href ? 'var(--primary)' : 'dimmed'}
      viewTransition
      style={{ fontFamily: 'monospace', viewTransitionName: item.title }} >
      {item.title}
    </Anchor>
  ))

  const totalResponses = responses.length;
  const resolvedCount = responses.filter(
    (row) => stageTitle(row.status, stages) === 'DONE'
  ).length;

  const handleExport = () => {
    exportToExcel({
      fileName: `loan-processing-feedback-${moment().format('YYYY-MM-DD')}.xlsx`,
      sheetName: 'Loan Processing',
      rows: filteredRows,
      columns: [
        { header: 'Project', key: 'project', width: 22 },
        { header: 'Phase', key: 'phase', width: 24 },
        { header: 'Block', key: 'block', width: 8 },
        { header: 'Lot', key: 'lot', width: 8 },
        { header: "Buyer's Name", key: 'buyers_name', width: 34 },
        { header: 'Q1', key: 'q1', width: 6, style: (row) => scoreExcelFill(row.q1) },
        { header: 'Q2', key: 'q2', width: 6, style: (row) => scoreExcelFill(row.q2) },
        { header: 'Q3', key: 'q3', width: 6, style: (row) => scoreExcelFill(row.q3) },
        { header: 'Q4', key: 'q4', width: 6, style: (row) => scoreExcelFill(row.q4) },
        { header: 'Q5', key: 'q5', width: 6, style: (row) => scoreExcelFill(row.q5) },
        { header: 'Q6', key: 'q6', width: 6, style: (row) => scoreExcelFill(row.q6) },
        { header: 'Q7', key: 'q7', width: 45 },
        { header: 'Concern', key: 'concern', width: 45 },
        { header: 'Action Taken', key: 'action_taken', width: 45 },
        {
          header: 'Status',
          value: (row) => stageTitle(row.status, stages) ?? 'Pending',
          width: 12,
          style: (row) => stageExcelFill(stageTitle(row.status, stages)),
        },
      ],
    });
  };

  return (
    <Container fluid p={0}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <div>
            <Group gap="sm">
              <ThemeIcon variant="light" color="indigo" size="lg" radius="md">
                <LandmarkIcon size={18} />
              </ThemeIcon>
              <Title order={2}>Loan Processing</Title>
            </Group>
            <Breadcrumbs mt={4} p={0} separator={<ChevronRight size={12} />} separatorMargin={2}>
              {items}
            </Breadcrumbs>
          </div>
          <Group gap="xs">
            <Badge variant="light" color="indigo" size="lg">
              {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
            </Badge>
            <Badge variant="light" color="teal" size="lg">
              {resolvedCount} resolved
            </Badge>
            <Button
              variant="light"
              color="indigo"
              size="xs"
              leftSection={<HelpCircleIcon size={14} />}
              onClick={() => setQuestionsOpened(true)}
            >
              Questions
            </Button>
            <Button
              variant="light"
              color="teal"
              size="xs"
              leftSection={<DownloadIcon size={14} />}
              onClick={handleExport}
              disabled={filteredRows.length === 0}
            >
              Export
            </Button>
          </Group>
        </Group>

        {loanProcessing.isError && (
          <Alert
            variant="light"
            color="red"
            icon={<AlertCircleIcon size={18} />}
            title="Unable to load loan processing responses"
          >
            Something went wrong while fetching the survey data. Please try again later.
          </Alert>
        )}

        <Card p="md">
          <FilterSection
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={setStatus}
            rating={rating}
            onRating={setRating}
            stageOptions={stageOptions}
          />
        </Card>

        <Card p={0} radius="xs">
          {loanProcessing.isLoading ? (
            <Stack gap={4} p="md">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} h={32} radius="sm" />
              ))}
            </Stack>
          ) : (
            <ScrollArea h="calc(100dvh - 290px)">
              <LoanProcessingTable
                rows={filteredRows}
                stages={stages}
                onManage={setSelectedRow}
                q7Filter={q7Filter}
                onQ7Filter={setQ7Filter}
              />
            </ScrollArea>
          )}
        </Card>
      </Stack>

      <ManageResponseDrawer
        row={selectedRow}
        opened={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
      />

      <QuestionsModal
        opened={questionsOpened}
        onClose={() => setQuestionsOpened(false)}
      />
    </Container>
  );
}

export default LoanProcessing;
