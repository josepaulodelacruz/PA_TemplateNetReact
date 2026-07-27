import { useQueryClient, useMutation } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";
import patchResponseRow from "./patchResponseRow";

const useFeedbackReservationManageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await client.post('/HomeBuyerFeedback/Reservation', params);
      return response.data;
    },
    // Reflect the saved concern / action taken / status on the table row right
    // away, then let the invalidated queries reconcile with the server.
    onSuccess: (_data, variables) => {
      patchResponseRow(queryClient, QueryKeys.FEEDBACK_RESERVATION_RESPONSES, variables);
      queryClient.invalidateQueries({ queryKey: [QueryKeys.FEEDBACK_RESERVATION_RESPONSES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.FEEDBACK_RESERVATION_THREADS] });
    },
  })
}

export default useFeedbackReservationManageMutation;
