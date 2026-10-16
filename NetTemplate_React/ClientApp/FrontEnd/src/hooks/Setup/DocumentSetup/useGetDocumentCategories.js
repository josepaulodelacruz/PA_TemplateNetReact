import { keepPreviousData, useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

const useGetDocumentCategories = (page = 1, pageSize = 10, search = "") => {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENT_CATEGORIES, page, pageSize, search],
    queryFn: async () => {
      const response = await client.get('/DocumentSetup', {
        params: { page, pageSize, search },
      });

      return response.data;
    },
    placeholderData: keepPreviousData, // avoids the table blanking out while paging
  })
}

export default useGetDocumentCategories;
