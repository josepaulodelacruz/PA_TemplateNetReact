import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackLoanProcessingThreads = (responseId) => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_LOAN_THREADS, responseId],
    enabled: Boolean(responseId),
    queryFn: async () => {
      const response = await client.get(`/HomeBuyerFeedback/LoanProcessing/threads/${responseId}`);
      return response.data;
    }
  });
}

export default useFeedbackLoanProcessingThreads;
