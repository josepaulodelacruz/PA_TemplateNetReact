import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentOptions = (mainId = null, subId = null) => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_OPTIONS, mainId, subId],
    queryFn: async () => {
      const response = await client.get('/DocumentSetup/options', {
        params: { mainId, subId },
      });

      return response.data;
    },
    enabled: mainId !== null || subId !== null,
  })
}

export default useGetDocumentOptions;
