import { useQueryClient, useMutation } from "@tanstack/react-query";
import client from "~/config/client";
import QueryKeys from "~/constants/QueryKeys";

const useFeedbackReservationManageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await client.post('/HomeBuyerFeedback/Reservation', params);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.FEEDBACK_RESERVATION_RESPONSES] }),
  })
}

export default useFeedbackReservationManageMutation;
