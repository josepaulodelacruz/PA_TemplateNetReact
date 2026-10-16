import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * The financing schemes of the matrix screen - one per tab. Each row carries a
 * document_count, so a tab can show how far its mapping has got.
 */
const useGetMatrixSchemes = () => {
  return useQuery({
    queryKey: [QueryKeys.MATRIX_SCHEMES],
    queryFn: async () => {
      const response = await client.get('/setup/DocumentFileSetup/schemes');
      return response.data;
    }
  })
}

export default useGetMatrixSchemes;
