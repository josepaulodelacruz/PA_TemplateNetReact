import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackAnsweredSurveys = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_ANSWERED_SURVEYS],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/metrics/answered-surveys');
      return response.data;
    }
  });
}

export default useFeedbackAnsweredSurveys;
