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
  Switch,
  Button,
} from '@mantine/core'
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import StringRoutes from '~/constants/StringRoutes';
import { Link } from 'react-router'
import {
  ChevronRight,
  SearchIcon,
  CalendarCheck2,
  AlertCircleIcon,
  HelpCircleIcon,
} from 'lucide-react'
import useFeedbackReservation from '~/hooks/HomeBuyerFeedback/useFeedbackReservation';
import useFeedbackReservationManageMutation from '~/hooks/HomeBuyerFeedback/useFeedbackReservationManageMutation';
import useFeedbackReservationQuestions from '~/hooks/HomeBuyerFeedback/useFeedbackReservationQuestions';
import {
  FILL_GOOD,
  FILL_WARN,
  scoreFill,
  answerFill,
  excelCell,
  excelHeader,
  excelRowNumber,
  excelTextCell,
} from './excelStyles';

const SCORE_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];

const averageScore = (row) => {
  const scores = SCORE_KEYS
    .map((key) => Number(row[key]))
    .filter((value) => !Number.isNaN(value) && value > 0);
  return scores.length
    ? scores.reduce((sum, value) => sum + value, 0) / scores.length
    : 0;
};

const FilterSection = ({ search, onSearch, status, onStatus, rating, onRating }) => {
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
        data={['Resolved', 'Pending']}
        value={status}
        onChange={onStatus}
        styles={{ label: { fontSize: '0.8rem' } }}
      />
      <div>
        <Text c="dimmed" size="xs" fw={500} mb={4}>Min. average rate</Text>
        <Rating value={rating} onChange={onRating} />
      </div>
    </Group>
  );
}

const QuestionsModal = ({ opened, onClose }) => {
  const questions = useFeedbackReservationQuestions();
  const items = questions.data?.body ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <Text fw={600}>Survey Questions</Text>
          <Text size="xs" c="dimmed">Reservation questionnaire (Q1–Q{items.length || 9})</Text>
        </div>
      }
    >
      {questions.isLoading && (
        <Stack gap="sm">
          {Array.from({ length: 9 }, (_, i) => (
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
              <Badge variant="light" color="brand" size="lg" miw={44}>
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

const ManageResponseModal = ({ row, opened, onClose }) => {
  const manageMutation = useFeedbackReservationManageMutation();

  const form = useForm({
    initialValues: {
      concern: '',
      action_taken: '',
      status: false,
    },
  });

  useEffect(() => {
    if (row) {
      form.setValues({
        concern: row.concern ?? '',
        action_taken: row.action_taken ?? '',
        status: Boolean(row.status),
      });
      form.resetDirty();
    }
  }, [row]);

  const handleSubmit = async (values) => {
    await manageMutation.mutateAsync(
      {
        response_id: row.id,
        concern: values.concern,
        action_taken: values.action_taken,
        status: values.status,
      },
      {
        onSuccess: (response) => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: response.message,
          });
          onClose();
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={600}>Manage Response</Text>
          <Text size="xs" c="dimmed">
            {[row?.buyers_name, location].filter(Boolean).join(' — ')}
          </Text>
        </div>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Textarea
            label="Concern"
            placeholder="Enter the buyer's concern"
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps('concern')}
          />
          <Textarea
            label="Action Taken"
            placeholder="Describe the action taken to address the concern"
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps('action_taken')}
          />
          <Switch
            label="Mark as resolved"
            {...form.getInputProps('status', { type: 'checkbox' })}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
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
    </Modal>
  );
};

const EmptyCellHint = () => (
  <Text size="xs" c="dimmed" fs="italic">Click to add</Text>
);

const ReservationTable = ({ rows, onManage }) => {
  const body = rows.map((row, index) => {
    const resolved = Boolean(row.status);
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
        <Table.Td style={excelTextCell}>{row.q6}</Table.Td>
        <Table.Td style={{ ...excelCell, ...answerFill(row.q7), textAlign: 'center' }}>
          {row.q7}
        </Table.Td>
        <Table.Td style={{ ...excelCell, ...answerFill(row.q8), textAlign: 'center' }}>
          {row.q8}
        </Table.Td>
        <Table.Td style={{ ...excelCell, whiteSpace: 'normal', minWidth: 120 }}>{row.q9}</Table.Td>
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
            ...(resolved ? FILL_GOOD : FILL_WARN),
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {resolved ? row.status : 'Pending'}
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
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>Q6</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 110 }}>Q7</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 90 }}>Q8</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 120 }}>Q9</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>Concern</Table.Th>
          <Table.Th style={{ ...excelHeader, minWidth: 240 }}>Action Taken</Table.Th>
          <Table.Th style={excelHeader}>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {body.length > 0 ? body : (
          <Table.Tr>
            <Table.Td colSpan={18} style={{ ...excelCell, textAlign: 'center' }}>
              <Text size="sm" c="dimmed" py="lg">No responses found</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  )
}

const Reservation = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [questionsOpened, setQuestionsOpened] = useState(false);

  const reservation = useFeedbackReservation();
  const responses = reservation.data?.body ?? [];

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
        const resolved = Boolean(row.status);
        if (status === 'Resolved' && !resolved) return false;
        if (status === 'Pending' && resolved) return false;
      }
      if (rating > 0 && averageScore(row) < rating) return false;
      return true;
    });
  }, [responses, search, status, rating]);

  const items = [
    { title: "HomeBuyer Feedback", href: StringRoutes.feedback },
    { title: "Reservation", href: null },
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
  const resolvedCount = responses.filter((row) => Boolean(row.status)).length;

  return (
    <Container fluid p={0}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <div>
            <Group gap="sm">
              <ThemeIcon variant="light" color="brand" size="lg" radius="md">
                <CalendarCheck2 size={18} />
              </ThemeIcon>
              <Title order={2}>Reservation</Title>
            </Group>
            <Breadcrumbs mt={4} p={0} separator={<ChevronRight size={12} />} separatorMargin={2}>
              {items}
            </Breadcrumbs>
          </div>
          <Group gap="xs">
            <Badge variant="light" color="brand" size="lg">
              {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
            </Badge>
            <Badge variant="light" color="teal" size="lg">
              {resolvedCount} resolved
            </Badge>
            <Button
              variant="light"
              size="xs"
              leftSection={<HelpCircleIcon size={14} />}
              onClick={() => setQuestionsOpened(true)}
            >
              Questions
            </Button>
          </Group>
        </Group>

        {reservation.isError && (
          <Alert
            variant="light"
            color="red"
            icon={<AlertCircleIcon size={18} />}
            title="Unable to load reservation responses"
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
          />
        </Card>

        <Card p={0} radius="xs">
          {reservation.isLoading ? (
            <Stack gap={4} p="md">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} h={32} radius="sm" />
              ))}
            </Stack>
          ) : (
            <ScrollArea h="calc(100dvh - 290px)">
              <ReservationTable rows={filteredRows} onManage={setSelectedRow} />
            </ScrollArea>
          )}
        </Card>
      </Stack>

      <ManageResponseModal
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

export default Reservation;
