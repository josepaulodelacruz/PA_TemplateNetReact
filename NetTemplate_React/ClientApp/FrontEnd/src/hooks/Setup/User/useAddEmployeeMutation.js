import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username) => {
      const response = await client.post(`/User/employees?username=${username}`);

      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries([QueryKeys.USER_LIST])
  })
}

export default useAddEmployeeMutation;
