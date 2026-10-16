import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentLabel = () => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_LABELS],
    queryFn: async () => {
      const response = await client.get('/setup/DocumentFileSetup/labels');
      return response.data;
    }
  })
}

export default useGetDocumentLabel

