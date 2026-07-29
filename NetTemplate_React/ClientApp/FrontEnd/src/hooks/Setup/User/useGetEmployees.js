import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useGetEmployees = () => {
  return useQuery({
    queryKey: [QueryKeys.USER_EMPLOYEES],
    queryFn: async () => {
      const response = await client.get("/User/employees");

      return response.data;
    }
  })
}

export default useGetEmployees;
