import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackLoanProcessingQuestions = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_LOAN_QUESTIONS],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/LoanProcessing/questions');
      return response.data;
    }
  });
}

export default useFeedbackLoanProcessingQuestions;
