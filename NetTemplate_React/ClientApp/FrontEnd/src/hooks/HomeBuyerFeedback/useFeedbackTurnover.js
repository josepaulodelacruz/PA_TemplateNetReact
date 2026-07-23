import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackTurnover = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_TURNOVER_RESPONSES],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/Turnover');
      return response.data;
    }
  });
}

export default useFeedbackTurnover;
