import {
  Container,
  Card,
  Group,
  ThemeIcon,
  Title,
  Divider,
  Button,
  ActionIcon,
  Collapse,
  Alert,
  TextInput,
  Tabs,
  Badge,
  Table,
  Text,
  Skeleton,
  Tooltip,
  Modal,
  Stack,
} from '@mantine/core'
import {
  ChevronDown,
  ChevronUp,
  InfoIcon,
  List,
  Plus,
  Pencil,
  Trash2,
  Check,
  Minus,
  Search,
} from 'lucide-react'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Fragment, useMemo, useState } from 'react'
import ErrorElement from '~/components/ErrorElement'
import useGetMatrixSchemes from '~/hooks/Setup/DocumentSetup/useGetMatrixSchemes'
import useGetMatrixLookups from '~/hooks/Setup/DocumentSetup/useGetMatrixLookups'
import useGetMatrix from '~/hooks/Setup/DocumentSetup/useGetMatrix'
import useMatrixRowDeleteMutation from '~/hooks/Setup/DocumentSetup/useMatrixRowDeleteMutation'
import MatrixRowModal from './MatrixRowModal'
import {
  groupColumnsByAxis,
  groupRowsBySection,
  buildCellIndex,
  readError,
} from './matrixConstants'

/*THE COLUMNS THAT SIT TO THE RIGHT OF THE CHECKBOX BLOCKS, IN WORKBOOK ORDER*/
const ATTRIBUTE_COLUMNS = [
  { key: 'condition_text', label: 'Applicable To / Condition', width: 240 },
  { key: 'scanned_copy', label: 'Scanned Copy Allowed?', width: 150 },
  { key: 'due_date', label: 'Due Date', width: 220 },
  { key: 'milestone', label: 'Milestone / Stage', width: 160 },
  { key: 'commission', label: 'Required for Commission?', width: 140 },
  { key: 'expiry', label: 'Expiring?', width: 200 },
  { key: 'source', label: 'Source', width: 110 },
]

const Tick = ({ checked }) =>
  checked ? (
    <ThemeIcon variant='light' color='green' size='sm' radius='sm'>
      <Check size={12} />
    </ThemeIcon>
  ) : (
    <Minus size={12} color='var(--mantine-color-dimmed)' />
  )

const CommissionCell = ({ flag }) => {
  if (flag === null || flag === undefined) {
    return <Text size='xs' c='dimmed'>Not set</Text>
  }

  return (
    <Badge size='sm' variant='light' color={flag ? 'green' : 'gray'}>
      {flag ? 'Yes' : 'No'}
    </Badge>
  );
}

/**
 * The workbook laid out as it reads on paper: the checkbox blocks span their columns
 * on the top header row and label themselves underneath, and the documents are broken
 * into their section bands.
 */
const MatrixTable = ({ axes, sections, cellIndex, onEdit, onDelete, isDeleting }) => {
  const axisColumns = useMemo(
    () => axes.flatMap((axis) => axis.columns),
    [axes]
  );

  /*No. + Document + EVERY CHECKBOX + THE ATTRIBUTES + THE ROW ACTIONS*/
  const totalColumns = 2 + axisColumns.length + ATTRIBUTE_COLUMNS.length + 1;

  return (
    <Table.ScrollContainer minWidth={1400} type='native'>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        verticalSpacing='xs'
        horizontalSpacing='sm'
        style={{ fontSize: 'var(--mantine-font-size-sm)' }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th rowSpan={2} w={56}>No.</Table.Th>
            <Table.Th rowSpan={2} miw={320}>Document / Requirement</Table.Th>
            {axes.map((axis) => (
              <Table.Th key={axis.mainId} colSpan={axis.columns.length} ta='center'>
                {axis.axisName}
              </Table.Th>
            ))}
            {ATTRIBUTE_COLUMNS.map((column) => (
              <Table.Th key={column.key} rowSpan={2} miw={column.width}>
                {column.label}
              </Table.Th>
            ))}
            <Table.Th rowSpan={2} w={90} />
          </Table.Tr>
          <Table.Tr>
            {axisColumns.map((column) => (
              <Table.Th key={column.column_key} ta='center' w={72}>
                <Text size='xs' fw={600} style={{ lineHeight: 1.2 }}>
                  {column.column_label}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sections.map((section) => (
            <Fragment key={`${section.labelId}-${section.rows[0].id}`}>
              <Table.Tr bg='var(--mantine-color-brand-light)'>
                <Table.Td colSpan={totalColumns}>
                  <Text size='xs' fw={700}>{section.section}</Text>
                </Table.Td>
              </Table.Tr>
              {section.rows.map((row, index) => (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Text size='xs' c='dimmed'>{row.seq_no ?? index + 1}</Text>
                  </Table.Td>
                  <Table.Td>{row.title}</Table.Td>
                  {axisColumns.map((column) => (
                    <Table.Td key={column.column_key} ta='center'>
                      <Tick checked={cellIndex.get(`${row.id}|${column.column_key}`)} />
                    </Table.Td>
                  ))}
                  <Table.Td>{row.condition_text}</Table.Td>
                  <Table.Td>{row.scanned_copy}</Table.Td>
                  <Table.Td>{row.due_date}</Table.Td>
                  <Table.Td>{row.milestone}</Table.Td>
                  <Table.Td>
                    <CommissionCell flag={row.is_required_for_commission} />
                  </Table.Td>
                  <Table.Td>{row.expiry}</Table.Td>
                  <Table.Td>{row.source}</Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap='nowrap'>
                      <Tooltip label='Edit this row'>
                        <ActionIcon variant='light' onClick={() => onEdit(row)}>
                          <Pencil size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label='Remove from this scheme'>
                        <ActionIcon
                          variant='light'
                          color='red'
                          disabled={isDeleting}
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

const Matrix = () => {
  const [expanded, { toggle }] = useDisclosure(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [isRowModalOpen, setRowModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const schemesQuery = useGetMatrixSchemes();
  const lookupsQuery = useGetMatrixLookups();

  const schemes = schemesQuery.data?.body ?? [];

  /*FALL BACK TO THE FIRST TAB UNTIL THE USER PICKS ONE, SINCE THE SCHEMES ARRIVE ASYNC*/
  const activeScheme = selectedScheme ?? schemes[0]?.code ?? null;
  const activeSchemeName = schemes.find((scheme) => scheme.code === activeScheme)?.name ?? '';

  const matrixQuery = useGetMatrix(activeScheme);
  const deleteMutation = useMatrixRowDeleteMutation();

  /*
    'x ?? []' BUILDS A NEW ARRAY EVERY RENDER, WHICH WOULD RE-RUN EVERY useMemo BELOW
    AND RESET THE MODAL'S FORM. THE QUERY BODY ITSELF IS STABLE, SO IT IS THE DEPENDENCY.
  */
  const matrixBody = matrixQuery.data?.body;
  const columns = useMemo(() => matrixBody?.columns ?? [], [matrixBody]);
  const rows = useMemo(() => matrixBody?.rows ?? [], [matrixBody]);
  const cells = useMemo(() => matrixBody?.cells ?? [], [matrixBody]);

  const lookupBody = lookupsQuery.data?.body;
  const lookups = useMemo(() => lookupBody ?? [], [lookupBody]);

  const axes = useMemo(() => groupColumnsByAxis(columns), [columns]);
  const cellIndex = useMemo(() => buildCellIndex(cells), [cells]);

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) =>
      `${row.title ?? ''} ${row.section ?? ''}`.toLowerCase().includes(term)
    );
  }, [rows, search]);

  const sections = useMemo(() => groupRowsBySection(visibleRows), [visibleRows]);

  const onOpenAdd = () => {
    setEditingRow(null);
    setRowModalOpen(true);
  }

  const onOpenEdit = (row) => {
    setEditingRow(row);
    setRowModalOpen(true);
  }

  const onConfirmDelete = () => {
    const target = deleteTarget;

    deleteMutation.mutate(
      { rowId: target.id, schemeCode: activeScheme },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: `"${target.title}" has been removed from ${activeSchemeName}.`,
          });

          setDeleteTarget(null);
        },
        onError: (mutationError) => {
          notifications.show({
            color: 'red',
            title: 'Failed to remove row',
            message: readError(mutationError),
          });
        },
      }
    );
  }

  const isLoading = schemesQuery.isLoading || matrixQuery.isLoading;
  const error = schemesQuery.error ?? matrixQuery.error;

  return (
    <Container fluid p={0}>
      <Card>
        <Group>
          <Group flex={1} onClick={toggle} style={{ cursor: 'pointer' }}>
            <ThemeIcon variant="light" color="brand" size="lg" radius="md">
              <List size={18} />
            </ThemeIcon>
            <Title order={2}>Matrix Mapping</Title>
          </Group>
          <ActionIcon variant="transparent" onClick={toggle}>
            {!expanded ? <ChevronDown /> : <ChevronUp />}
          </ActionIcon>
        </Group>
        <Divider mt={10} />
        <Collapse in={expanded}>
          <Alert icon={<InfoIcon />} variant="light" my={10}>
            You can add mapping for each financing scheme that will be applied to the buyers.
            The checkbox columns come from the Category tab and the documents from the
            Documents tab, so this screen only maps the two together.
          </Alert>
        </Collapse>

        {schemesQuery.isError ? (
          <ErrorElement>{readError(schemesQuery.error)}</ErrorElement>
        ) : (
          <Tabs mt={10} value={activeScheme} onChange={setSelectedScheme}>
            <Tabs.List>
              {schemes.map((scheme) => (
                <Tabs.Tab
                  key={scheme.code}
                  value={scheme.code}
                  rightSection={
                    <Badge size='sm' variant='light' color='brand' circle>
                      {scheme.document_count}
                    </Badge>
                  }
                >
                  {scheme.name}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        )}

        <Group justify='space-between' mt={16} mb={10}>
          <TextInput
            w={320}
            placeholder='Search document or section'
            leftSection={<Search size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Button
            leftSection={<Plus size={16} />}
            disabled={!activeScheme}
            onClick={onOpenAdd}
          >
            ADD DOCUMENT
          </Button>
        </Group>

        {isLoading ? (
          <Skeleton height={220} />
        ) : matrixQuery.isError ? (
          <ErrorElement>{readError(error)}</ErrorElement>
        ) : rows.length === 0 ? (
          <Text size='sm' c='dimmed' py={20} ta='center'>
            No document mapped to {activeSchemeName || 'this scheme'} yet.
          </Text>
        ) : visibleRows.length === 0 ? (
          <Text size='sm' c='dimmed' py={20} ta='center'>
            No document matches "{search}".
          </Text>
        ) : (
          <MatrixTable
            axes={axes}
            sections={sections}
            cellIndex={cellIndex}
            onEdit={onOpenEdit}
            onDelete={setDeleteTarget}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Card>

      <MatrixRowModal
        opened={isRowModalOpen}
        onClose={() => setRowModalOpen(false)}
        schemeCode={activeScheme}
        schemeName={activeSchemeName}
        columns={columns}
        lookups={lookups}
        row={editingRow}
        cellIndex={cellIndex}
      />

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={<Text fw={700}>Remove from checklist</Text>}
      >
        <Stack gap={12}>
          <Text size='sm'>
            Remove <b>{deleteTarget?.title}</b> from {activeSchemeName}? The document
            itself stays on the Documents tab and can be added back later.
          </Text>
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              CANCEL
            </Button>
            <Button color='red' loading={deleteMutation.isPending} onClick={onConfirmDelete}>
              REMOVE
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default Matrix
