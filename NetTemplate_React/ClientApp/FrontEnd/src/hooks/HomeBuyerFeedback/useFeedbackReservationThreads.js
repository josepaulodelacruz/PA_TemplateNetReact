import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackReservationThreads = (responseId) => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_RESERVATION_THREADS, responseId],
    enabled: Boolean(responseId),
    queryFn: async () => {
      const response = await client.get(`/HomeBuyerFeedback/Reservation/threads/${responseId}`);
      return response.data;
    }
  });
}

export default useFeedbackReservationThreads;
