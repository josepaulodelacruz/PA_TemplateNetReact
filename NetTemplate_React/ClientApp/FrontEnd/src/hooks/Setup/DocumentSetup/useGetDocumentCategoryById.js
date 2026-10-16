import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentCategoryById = (id) => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_CATEGORY_ID, id],
    queryFn: async () => {
      const response = await client.get('/DocumentSetup/' + id);

      return response.data;
    },
    enabled: id !== undefined && id !== null && id !== '', // if true fetch on page mount
  })
}

export default useGetDocumentCategoryById;
