import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Expects { optionId, mainId }. mainId is only used to invalidate the parent
 * category caches - the endpoint itself only needs the option id. The delete is
 * a soft one, so the label survives for documents that already answered with it.
 */
const useDocumentOptionDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ optionId }) => {
      const response = await client.delete(`/DocumentSetup/options/${optionId}`);

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

export default useDocumentOptionDeleteMutation;
