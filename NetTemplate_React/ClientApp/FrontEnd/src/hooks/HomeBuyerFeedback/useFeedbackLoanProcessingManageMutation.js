import { useQueryClient, useMutation } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackLoanProcessingManageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await client.post('/HomeBuyerFeedback/LoanProcessing', params);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.FEEDBACK_LOAN_RESPONSES] }),
  })
}

export default useFeedbackLoanProcessingManageMutation;
