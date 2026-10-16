import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Expects { subId, mainId }. mainId is only used to invalidate the parent
 * category caches - the endpoint itself only needs the sub-category id.
 */
const useDocumentSubCategoryDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subId }) => {
      const response = await client.delete(`/DocumentSetup/sub-categories/${subId}`);

      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORY_ID, variables.mainId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_SUB_CATEGORIES, variables.mainId] });
    },
  })
}

export default useDocumentSubCategoryDeleteMutation;
