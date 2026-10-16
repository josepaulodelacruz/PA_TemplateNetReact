import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";
import { toDocumentCategoryPayload } from "./documentCategoryPayload";

/**
 * Expects { id, ...formValues }. The proc rebuilds every sub-category and
 * option from the payload, so send the complete category, not a partial one.
 */
const useDocumentCategoryEditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }) => {
      const response = await client.put(`/DocumentSetup/${id}`, toDocumentCategoryPayload(values));

      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORY_ID, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_SUB_CATEGORIES, variables.id] });
    },
  })
}

export default useDocumentCategoryEditMutation;
