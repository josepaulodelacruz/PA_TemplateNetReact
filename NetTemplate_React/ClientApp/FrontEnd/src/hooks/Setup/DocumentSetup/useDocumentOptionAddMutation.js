import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Expects { mainId, subId, label }. subId decides the parent: with one the option
 * belongs to that sub-category, without one it belongs to the category itself.
 * mainId is always the category id - the caches are keyed by it either way.
 */
const useDocumentOptionAddMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mainId, subId, label }) => {
      const response = await client.post('/DocumentSetup/options', {
        label: (label ?? '').trim(),
        main_category_id: subId ? null : mainId,
        sub_category_id: subId ?? null,
      });

      return response.data;
    },
    onSuccess: (_data, variables) => {
      /*THE CATEGORY LIST CARRIES THE OPTION COUNT, SO IT GOES STALE TOO*/
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_OPTIONS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORY_ID, variables.mainId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_SUB_CATEGORIES, variables.mainId] });
    },
  })
}

export default useDocumentOptionAddMutation;
