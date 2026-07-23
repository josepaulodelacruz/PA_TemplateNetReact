import { useQueryClient, useMutation } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackTurnoverManageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await client.post('/HomeBuyerFeedback/Turnover', params);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.FEEDBACK_TURNOVER_RESPONSES] }),
  })
}

export default useFeedbackTurnoverManageMutation;
