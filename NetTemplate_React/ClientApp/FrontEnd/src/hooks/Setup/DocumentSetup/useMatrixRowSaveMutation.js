import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Hits 'SAVE CHECKLIST ROW'. An id of 0 - what the add form sends - inserts,
 * anything else updates that row, so both cases share one mutation.
 *
 * The checkboxes are posted whole and the proc rebuilds them, so an unticked box
 * has to travel too - leaving it out would read as 'never answered' instead of 'no'.
 */
const useMatrixRowSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schemeCode, row }) => {
      const payload = {
        file_id: Number(row.fileId),
        seq_no: toNullableInt(row.seqNo),
        condition_text: row.conditionText?.trim() || null,
        scanned_copy_id: toNullableInt(row.scannedCopyId),
        due_date_id: toNullableInt(row.dueDateId),
        milestone_id: toNullableInt(row.milestoneId),
        expiry_id: toNullableInt(row.expiryId),
        source_id: toNullableInt(row.sourceId),
        is_required_for_commission: row.isRequiredForCommission,
        remarks: row.remarks?.trim() || null,
        cells: row.cells,
      };

      const response = row.id
        ? await client.put(`/setup/DocumentFileSetup/matrix/${schemeCode}/rows/${row.id}`, payload)
        : await client.post(`/setup/DocumentFileSetup/matrix/${schemeCode}/rows`, payload);

      return response.data;
    },
    onSuccess: (_data, { schemeCode }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_CHECKLIST, schemeCode] });
      /*THE DOCUMENT HAS LEFT THE PICKER, AND THE TAB BADGE COUNTS ONE MORE*/
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_UNMAPPED, schemeCode] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_SCHEMES] });
    },
  })
}

export default useMatrixRowSaveMutation;
