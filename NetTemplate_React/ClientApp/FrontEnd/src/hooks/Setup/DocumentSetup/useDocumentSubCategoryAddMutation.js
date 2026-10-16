import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Expects { mainId, name, type, options }. Adds one sub-category without
 * touching its siblings - unlike the category edit, which rebuilds the set.
 */
const useDocumentSubCategoryAddMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mainId, name, type, options }) => {
      const response = await client.post(`/DocumentSetup/${mainId}/sub-categories`, {
        name: (name ?? '').trim(),
        type,
        options: options ?? [],
      });

      return response.data;
    },
    onSuccess: (_data, variables) => {
      /*THE CATEGORY LIST CARRIES THE SUB CATEGORY COUNT, SO IT GOES STALE TOO*/
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORY_ID, variables.mainId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_SUB_CATEGORIES, variables.mainId] });
    },
  })
}

export default useDocumentSubCategoryAddMutation;
