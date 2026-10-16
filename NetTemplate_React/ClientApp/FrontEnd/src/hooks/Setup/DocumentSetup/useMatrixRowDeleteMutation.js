import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Soft deletes the row off this scheme's checklist. The document itself is left
 * alone - it stays on the Documents tab and can be added to the scheme again.
 */
const useMatrixRowDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rowId }) => {
      const response = await client.delete(`/setup/DocumentFileSetup/matrix/rows/${rowId}`);
      return response.data;
    },
    onSuccess: (_data, { schemeCode }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_CHECKLIST, schemeCode] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_UNMAPPED, schemeCode] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MATRIX_SCHEMES] });
    },
  })
}

export default useMatrixRowDeleteMutation;
