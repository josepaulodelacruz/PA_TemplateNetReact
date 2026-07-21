import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackLoanOverallSatisfactory = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_LOAN_OVERALL_SATISFACTORY],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/metrics/loan-overall-satisfactory');
      return response.data;
    }
  });
}

export default useFeedbackLoanOverallSatisfactory;
