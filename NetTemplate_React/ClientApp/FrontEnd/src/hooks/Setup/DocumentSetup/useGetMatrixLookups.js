import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * Every select of the matrix row form in one call. The rows arrive flat and keyed
 * by group_code - SCANNED_COPY, DUE_DATE, MILESTONE, EXPIRY, SOURCE - so the form
 * filters rather than fetching five times.
 *
 * The values change about as often as a policy does, so the cache is kept long.
 */
const useGetMatrixLookups = () => {
  return useQuery({
    queryKey: [QueryKeys.MATRIX_LOOKUPS],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const response = await client.get('/setup/DocumentFileSetup/matrix/lookups');
      return response.data;
    }
  })
}

export default useGetMatrixLookups;
