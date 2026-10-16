import {
  Modal,
  Group,
  Stack,
  Paper,
  Text,
  Badge,
  Button,
  Select,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  SegmentedControl,
  Divider,
  Skeleton,
  Input,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo } from 'react'
import useGetUnmappedDocuments from '~/hooks/Setup/DocumentSetup/useGetUnmappedDocuments'
import useMatrixRowSaveMutation from '~/hooks/Setup/DocumentSetup/useMatrixRowSaveMutation'
import {
  LOOKUP_GROUP,
  buildColumnKey,
  groupColumnsByAxis,
  toSelectData,
  readError,
} from './matrixConstants'

/*THE 'Required for Commission?' COLUMN IS A DRAFT IN THE WORKBOOK, SO 'NOT SET' IS A REAL ANSWER*/
const COMMISSION = {
  unset: 'unset',
  yes: 'yes',
  no: 'no',
}

const toCommissionValue = (flag) => {
  if (flag === true) return COMMISSION.yes;
  if (flag === false) return COMMISSION.no;
  return COMMISSION.unset;
}

const fromCommissionValue = (value) => {
  if (value === COMMISSION.yes) return true;
  if (value === COMMISSION.no) return false;
  return null;
}

const EMPTY_ROW = {
  id: 0,
  fileId: null,
  seqNo: '',
  conditionText: '',
  scannedCopyId: null,
  dueDateId: null,
  milestoneId: null,
  expiryId: null,
  sourceId: null,
  commission: COMMISSION.unset,
  remarks: '',
  cells: {},
}

/**
 * The checkbox blocks of the workbook - Customer Type, Required to Buyer, Civil
 * Status, Employment Status - drawn from whatever categories are active rather
 * than from a fixed list, so a new category shows up here on its own.
 */
const AxisCheckboxes = ({ axes, form }) => {
  if (axes.length === 0) {
    return (
      <Text size='sm' c='dimmed'>
        No category set up yet. Add one on the Category tab and it becomes a column here.
      </Text>
    );
  }

  return (
    <Stack gap={10}>
      {axes.map((axis) => (
        <Paper key={axis.mainId} withBorder p={12} radius='md'>
          <Text size='sm' fw={700} mb={8}>{axis.axisName}</Text>
          <Group gap={16} wrap='wrap'>
            {axis.columns.map((column) => (
              <Checkbox
                key={column.column_key}
                label={column.column_label}
                checked={Boolean(form.getValues().cells[column.column_key])}
                onChange={(event) =>
                  form.setFieldValue(`cells.${column.column_key}`, event.currentTarget.checked)
                }
              />
            ))}
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

/**
 * Adds a document to one financing scheme's checklist, or edits the row it already
 * has there. Pass 'row' to edit, leave it null to add.
 *
 * Every checkbox is posted, ticked or not - the proc rebuilds the row's cells, so
 * an omitted box would read as 'never answered' rather than as 'no'.
 */
const MatrixRowModal = ({
  opened,
  onClose,
  schemeCode,
  schemeName,
  columns,
  lookups,
  row,
  cellIndex,
}) => {
  const isEditing = Boolean(row?.id);
  const saveMutation = useMatrixRowSaveMutation();
  const {
    data: unmappedData,
    isLoading: isLoadingUnmapped,
  } = useGetUnmappedDocuments(schemeCode, opened && !isEditing);

  const form = useForm({
    mode: 'controlled',
    initialValues: EMPTY_ROW,
    validate: {
      fileId: (value) => (!value ? 'Document is required' : null),
    },
  });

  const axes = useMemo(() => groupColumnsByAxis(columns), [columns]);

  const unmappedOptions = useMemo(() => {
    const documents = unmappedData?.body ?? [];

    return documents.map((document) => ({
      value: String(document.id),
      label: document.section ? `${document.section} - ${document.title}` : document.title,
    }));
  }, [unmappedData]);

  const selectData = useMemo(() => ({
    scannedCopy: toSelectData(lookups, LOOKUP_GROUP.scannedCopy),
    dueDate: toSelectData(lookups, LOOKUP_GROUP.dueDate),
    milestone: toSelectData(lookups, LOOKUP_GROUP.milestone),
    expiry: toSelectData(lookups, LOOKUP_GROUP.expiry),
    source: toSelectData(lookups, LOOKUP_GROUP.source),
  }), [lookups]);

  /*
    THE MODAL IS MOUNTED ONCE AND REUSED FOR EVERY ROW, SO IT HAS TO CATCH UP WITH
    THE ROW THAT WAS JUST PICKED - AND NOT INHERIT THE PREVIOUS ONE'S DRAFT.
    'form' is deliberately out of the dependency list: a controlled useForm returns
    a fresh identity every render, so including it would re-run this on every render
    and setValues() would loop.
  */
  useEffect(() => {
    if (!opened) return;

    if (!row) {
      form.setValues(EMPTY_ROW);
      form.clearErrors();
      return;
    }

    const cells = {};

    columns.forEach((column) => {
      cells[column.column_key] = cellIndex.get(`${row.id}|${column.column_key}`) ?? false;
    });

    form.setValues({
      id: row.id,
      fileId: String(row.file_id),
      seqNo: row.seq_no ?? '',
      conditionText: row.condition_text ?? '',
      scannedCopyId: row.scanned_copy_id ? String(row.scanned_copy_id) : null,
      dueDateId: row.due_date_id ? String(row.due_date_id) : null,
      milestoneId: row.milestone_id ? String(row.milestone_id) : null,
      expiryId: row.expiry_id ? String(row.expiry_id) : null,
      sourceId: row.source_id ? String(row.source_id) : null,
      commission: toCommissionValue(row.is_required_for_commission),
      remarks: row.remarks ?? '',
      cells,
    });
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, row, columns, cellIndex]);

  const handleSubmit = (values) => {
    /*EVERY COLUMN TRAVELS, SO CLEARING A BOX STORES A REAL 'NO'*/
    const cells = columns.map((column) => ({
      main_id: column.main_id,
      sub_id: column.sub_id ?? null,
      option_id: column.option_id ?? null,
      is_applicable: Boolean(values.cells[buildColumnKey(column)]),
    }));

    saveMutation.mutate(
      {
        schemeCode,
        row: {
          id: values.id,
          fileId: values.fileId,
          seqNo: values.seqNo,
          conditionText: values.conditionText,
          scannedCopyId: values.scannedCopyId,
          dueDateId: values.dueDateId,
          milestoneId: values.milestoneId,
          expiryId: values.expiryId,
          sourceId: values.sourceId,
          isRequiredForCommission: fromCommissionValue(values.commission),
          remarks: values.remarks,
          cells,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: isEditing
              ? 'Checklist row has been updated.'
              : 'Document has been added to this financing scheme.',
          });

          onClose();
        },
        onError: (mutationError) => {
          const message = readError(mutationError);

          if (message.toLowerCase().includes('already on the checklist')) {
            form.setFieldError('fileId', message);
          }

          notifications.show({
            color: 'red',
            title: isEditing ? 'Failed to update row' : 'Failed to add document',
            message,
          });
        },
      }
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='xl'
      title={
        <Group gap={8}>
          <Text fw={700}>{isEditing ? 'Edit Checklist Row' : 'Add Document'}</Text>
          {schemeName && <Badge variant='light' color='brand'>{schemeName}</Badge>}
        </Group>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={12}>
          {isEditing ? (
            <Group gap={8}>
              <Text size='sm' c='dimmed'>Document</Text>
              <Text fw={600}>{row?.title}</Text>
              {row?.section && <Badge size='sm' variant='light' color='gray'>{row.section}</Badge>}
            </Group>
          ) : isLoadingUnmapped ? (
            <Skeleton height={60} />
          ) : (
            <Select
              label='Document'
              placeholder={
                unmappedOptions.length === 0
                  ? 'Every document is already on this checklist'
                  : 'Pick a document'
              }
              searchable
              disabled={unmappedOptions.length === 0}
              data={unmappedOptions}
              description='Only documents not on this scheme yet are listed. Add new ones on the Documents tab.'
              {...form.getInputProps('fileId')}
            />
          )}

          <Group grow align='flex-start'>
            <NumberInput
              label='No.'
              placeholder='Order within the scheme'
              min={1}
              allowDecimal={false}
              {...form.getInputProps('seqNo')}
            />
            <Select
              label='Scanned Copy Allowed?'
              placeholder='Pick one'
              clearable
              data={selectData.scannedCopy}
              {...form.getInputProps('scannedCopyId')}
            />
          </Group>

          <TextInput
            label='Applicable To / Condition'
            placeholder='e.g. Borrower, Spouse, Co-Borrower'
            {...form.getInputProps('conditionText')}
          />

          <Group grow align='flex-start'>
            <Select
              label='Due Date'
              placeholder='Pick one'
              clearable
              data={selectData.dueDate}
              {...form.getInputProps('dueDateId')}
            />
            <Select
              label='Milestone / Stage'
              placeholder='Pick one'
              clearable
              data={selectData.milestone}
              {...form.getInputProps('milestoneId')}
            />
          </Group>

          <Group grow align='flex-start'>
            <Select
              label='Expiring?'
              placeholder='Pick one'
              clearable
              data={selectData.expiry}
              {...form.getInputProps('expiryId')}
            />
            <Select
              label='Source'
              placeholder='Pick one'
              clearable
              data={selectData.source}
              {...form.getInputProps('sourceId')}
            />
          </Group>

          <Input.Wrapper
            label='Required for Commission?'
            description='Leave unset while the policy is still a draft.'
          >
            <SegmentedControl
              mt={6}
              data={[
                { value: COMMISSION.unset, label: 'Not set' },
                { value: COMMISSION.yes, label: 'Yes' },
                { value: COMMISSION.no, label: 'No' },
              ]}
              {...form.getInputProps('commission')}
            />
          </Input.Wrapper>

          <Divider label='Applies to' labelPosition='left' />

          <AxisCheckboxes axes={axes} form={form} />

          <Textarea
            label='Remarks'
            placeholder='Anything worth noting about this requirement'
            autosize
            minRows={2}
            {...form.getInputProps('remarks')}
          />

          <Group justify='flex-end' mt={4}>
            <Button variant='default' onClick={onClose} disabled={saveMutation.isPending}>
              CANCEL
            </Button>
            <Button type='submit' loading={saveMutation.isPending}>
              {isEditing ? 'SAVE CHANGES' : 'ADD TO CHECKLIST'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default MatrixRowModal;
