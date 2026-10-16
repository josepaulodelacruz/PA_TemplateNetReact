import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentSubCategories = (mainId) => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_SUB_CATEGORIES, mainId],
    queryFn: async () => {
      const response = await client.get(`/DocumentSetup/${mainId}/sub-categories`);

      return response.data;
    },
    enabled: mainId !== undefined && mainId !== null && mainId !== '',
  })
}

export default useGetDocumentSubCategories;
