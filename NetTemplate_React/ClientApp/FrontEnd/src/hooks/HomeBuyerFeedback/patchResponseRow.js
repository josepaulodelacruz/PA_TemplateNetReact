// Writes a just-saved concern / action taken / status onto the cached response
// row so the feedback table updates without waiting for the refetch to land.
// `variables` is the payload sent to the manage endpoint.
const patchResponseRow = (queryClient, queryKey, variables) => {
  queryClient.setQueryData([queryKey], (previous) => {
    if (!Array.isArray(previous?.body)) return previous;

    return {
      ...previous,
      body: previous.body.map((row) =>
        String(row.id) === String(variables.response_id)
          ? {
              ...row,
              concern: variables.concern,
              action_taken: variables.action_taken,
              status: variables.status,
            }
          : row
      ),
    };
  });
};

export default patchResponseRow;
