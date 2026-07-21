import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackHiPlusAnswers = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_HIPLUS_ANSWERS],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/metrics/hiplus-answers');
      return response.data;
    }
  });
}

export default useFeedbackHiPlusAnswers;
