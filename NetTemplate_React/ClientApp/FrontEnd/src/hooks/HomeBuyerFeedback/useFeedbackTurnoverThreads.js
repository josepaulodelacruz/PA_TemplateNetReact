import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackTurnoverThreads = (responseId) => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_TURNOVER_THREADS, responseId],
    enabled: Boolean(responseId),
    queryFn: async () => {
      const response = await client.get(`/HomeBuyerFeedback/Turnover/threads/${responseId}`);
      return response.data;
    }
  });
}

export default useFeedbackTurnoverThreads;
