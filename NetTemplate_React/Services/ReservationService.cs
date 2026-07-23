using NetTemplate_React.Models;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Threading.Tasks;

namespace NetTemplate_React.Services
{
    public interface IReservationService
    {
        Task<Response> GetQuestions();
        Task<Response> GetResponses();

        Task<Response> AddResponse(FeedbackFormRequest req); 

    }
    public class ReservationService : IReservationService
    {
        private string _conString;

        public ReservationService(string conString)
        {
            _conString = conString;
        }

        public async Task<Response> GetQuestions()
        {
            try
            {
                var dataTable = new DataTable();
                StringBuilder CommandText = new StringBuilder();
                CommandText.Append("[HFF].[NSP_ManageReservation]");

                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FLAG", 2);

                        CommandText.Append("@FLAG=-2");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        foreach (DataColumn col in dataTable.Columns)
                        {
                            col.ColumnName = col.ColumnName.ToLower();
                        }


                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully fetch questionaires",
                            body: dataTable
                        );

                    }
                }

            }
            catch (Exception Ex)
            {
                return new Response(
                    success: false,
                    debugScript: Ex.StackTrace,
                    message: Ex.Message,
                    body: null
                );
            }
        }


        public async Task<Response> AddResponse(FeedbackFormRequest req)
        {
            try
            {
                StringBuilder CommandText = new StringBuilder();
                CommandText.Append("[HFF].[NSP_ManageReservation]");

                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FLAG", 1);
                        cmd.Parameters.AddWithValue("@RESPONSE_ID", req.ResponseId);
                        cmd.Parameters.AddWithValue("@CONCERN", req.Concern);
                        cmd.Parameters.AddWithValue("@ACTION_TAKEN", req.ActionTaken);
                        cmd.Parameters.AddWithValue("@STATUS", req.Status);
                        cmd.Parameters.AddWithValue("@CREATED_BY", req.CreatedBy);

                        await cmd.ExecuteNonQueryAsync();

                        CommandText.Append("@FLAG=1 " + " ,@RESPONSE_ID=" + req.ResponseId + " ,@CONCERN=" + req.Concern + " ,@ACTION_TAKEN=" + req.ActionTaken + " ,@STATUS=" + req.Status + " ,@CREATED_BY=" + req.CreatedBy);

                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully added a response",
                            body: null 
                        );

                    }
                }

            }
            catch (Exception Ex)
            {
                return new Response(
                    success: false,
                    debugScript: Ex.StackTrace,
                    message: Ex.Message,
                    body: null
                );
            }
        }

        public async Task<Response> GetResponses()
        {
            try
            {
                var dataTable = new DataTable();
                StringBuilder CommandText = new StringBuilder();
                CommandText.Append("[HFF].[NSP_ManageReservation]");

                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FLAG", 0);

                        CommandText.Append("@FLAG=0");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        foreach (DataColumn col in dataTable.Columns)
                        {
                            col.ColumnName = col.ColumnName.ToLower();
                        }


                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully fetch responses",
                            body: dataTable
                        );

                    }
                }
 
            } 
            catch (Exception Ex)
            {
                return new Response(
                    success: false,
                    debugScript: Ex.StackTrace,
                    message: Ex.Message,
                    body: null
                ); 
            }
        }

    }
}
