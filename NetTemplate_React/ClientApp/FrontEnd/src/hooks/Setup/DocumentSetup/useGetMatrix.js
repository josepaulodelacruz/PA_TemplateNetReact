import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/Constants/QueryKeys";

/**
 * One tab of the matrix. The body arrives as four separate pieces - scheme,
 * columns, rows, cells - because the matrix is columns x rows and joining it
 * server side would repeat every document once per column.
 *
 * Pass a falsy scheme while the tabs are still loading and the call is skipped.
 */
const useGetMatrix = (schemeCode) => {
  return useQuery({
    queryKey: [QueryKeys.MATRIX_CHECKLIST, schemeCode],
    enabled: Boolean(schemeCode),
    queryFn: async () => {
      const response = await client.get(`/setup/DocumentFileSetup/matrix/${schemeCode}`);
      return response.data;
    }
  })
}

export default useGetMatrix;
