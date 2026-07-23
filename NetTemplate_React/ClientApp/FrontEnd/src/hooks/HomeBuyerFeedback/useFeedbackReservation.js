import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackReservation = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_RESERVATION_RESPONSES],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/Reservation');
      return response.data;
    }
  });
}

export default useFeedbackReservation;
