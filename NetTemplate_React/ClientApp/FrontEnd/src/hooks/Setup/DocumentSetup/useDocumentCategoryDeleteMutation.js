import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useDocumentCategoryDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await client.delete(`/DocumentSetup/${id}`);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_CATEGORIES] });
    },
  })
}

export default useDocumentCategoryDeleteMutation;
