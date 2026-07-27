import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackActionTakenStage = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_ACTION_TAKEN_STAGES],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/ActionTakenStage');
      return response.data;
    }
  });
}

export default useFeedbackActionTakenStage;
