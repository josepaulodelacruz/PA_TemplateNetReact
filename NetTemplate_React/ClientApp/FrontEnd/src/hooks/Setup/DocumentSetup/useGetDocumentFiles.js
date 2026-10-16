import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentFiles = () => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_FILES],
    queryFn: async () => {
      const response = await client.get('/setup/DocumentFileSetup/documents');
      return response.data;
    }
  })
}

export default useGetDocumentFiles;
