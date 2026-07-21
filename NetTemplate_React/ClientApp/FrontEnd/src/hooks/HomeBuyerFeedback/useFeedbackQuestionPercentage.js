import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackQuestionPercentage = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_QUESTIONS_PERCENTAGE],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/metrics/questions/percentage');
      return response.data;
    }
  });
}

export default useFeedbackQuestionPercentage;
