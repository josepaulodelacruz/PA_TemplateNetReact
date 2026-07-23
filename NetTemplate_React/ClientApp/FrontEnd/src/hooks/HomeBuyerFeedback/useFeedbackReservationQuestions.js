import { useQuery } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackReservationQuestions = () => {
  return useQuery({
    queryKey: [QueryKeys.FEEDBACK_RESERVATION_QUESTIONS],
    queryFn: async () => {
      const response = await client.get('/HomeBuyerFeedback/Reservation/questions');
      return response.data;
    }
  });
}

export default useFeedbackReservationQuestions;
