import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackLoanProcessing = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_LOAN_RESPONSES],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/LoanProcessing');
      return response.data;
    }
  });
}

export default useFeedbackLoanProcessing;
