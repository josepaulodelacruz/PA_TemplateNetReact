import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Hits 'CREATE/UPDATE FILE DOCUMENT'. An id of 0 - what the add form sends - inserts,
 * anything else updates that document, so both cases share one mutation.
 */
const useDocumentFileSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id = 0, title, labelId }) => {
      const payload = {
        title: title.trim(),
        label_id: Number(labelId),
      };

      const response = id
        ? await client.put(`/setup/DocumentFileSetup/documents/${id}`, payload)
        : await client.post('/setup/DocumentFileSetup/documents', payload);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENT_FILES] });
    },
  })
}

export default useDocumentFileSaveMutation;
