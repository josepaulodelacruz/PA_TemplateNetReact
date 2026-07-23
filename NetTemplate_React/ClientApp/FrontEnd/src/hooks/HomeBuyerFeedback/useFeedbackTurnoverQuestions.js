import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackTurnoverQuestions = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_TURNOVER_QUESTIONS],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/Turnover/questions');
      return response.data;
    }
  });
}

export default useFeedbackTurnoverQuestions;
