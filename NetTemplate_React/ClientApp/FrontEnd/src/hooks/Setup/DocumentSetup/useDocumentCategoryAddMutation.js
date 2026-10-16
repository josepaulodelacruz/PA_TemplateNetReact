import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";
import { toDocumentCategoryPayload } from "./documentCategoryPayload";

/**
 * Takes the raw form values from DocumentCategory.jsx - the mapping to the
 * snake_case API contract happens here so the component never deals with it.
 */
const useDocumentCategoryAddMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const response = await client.post('/DocumentSetup', toDocumentCategoryPayload(values));

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
    },
  })
}

export default useDocumentCategoryAddMutation;
