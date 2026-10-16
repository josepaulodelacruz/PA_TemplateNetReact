import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * What the 'add document' picker offers - every active document that is not on
 * this scheme's checklist yet. Fetched only while the picker is open.
 */
const useGetUnmappedDocuments = (schemeCode, enabled = true) => {
  return useQuery({
    queryKey: [QueryKeys.MATRIX_UNMAPPED, schemeCode],
    enabled: Boolean(schemeCode) && enabled,
    queryFn: async () => {
      const response = await client.get(`/setup/DocumentFileSetup/matrix/${schemeCode}/unmapped`);
      return response.data;
    }
  })
}

export default useGetUnmappedDocuments;
