using Microsoft.Extensions.Configuration;
using NetTemplate_React.Models;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NetTemplate_React.Utils;

namespace NetTemplate_React.Services
{
    public interface IMetricsServices
    {
        Task<Response> GetQuestionPercentage();

        Task<Response> GetAnsweredSurveys();
        Task<Response> GetMetricsHiPlusDownload();

        Task<Response> GetOverallSatisfactionLoanProcess();

    }

    public class MetricsServices : IMetricsServices
    {

        private readonly string _conString; 

        public MetricsServices(string conString)
        {
            _conString = conString;
        }

        public async Task<Response> GetOverallSatisfactionLoanProcess()
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[HFF].[NSP_SurveyInitialMetrics]");
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", 3);

                        CommandText.AppendLine("@FLAG=3");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }


                return new Response(
                    success: true,
                    debugScript: CommandText.ToString(),
                    message: "Successfully fetch satisfactory metrics",
                    body: dataTable 
                );
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


        public async Task<Response> GetMetricsHiPlusDownload()
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[HFF].[NSP_SurveyInitialMetrics]");
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", 2);

                        CommandText.AppendLine("@FLAG=2");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
;
                }


                var groupData = dataTable.Rows.Cast<DataRow>()
                    .GroupBy(row => new
                    {
                        question = DataRowUtils.GetValue<string>(row, "Question")
                    })
                    .Select(group => new
                    {
                        question = group.Key.question,
                        items = group.Select(r => new
                        {
                            answer = DataRowUtils.GetValue<string>(r, "Answer"),
                            total = DataRowUtils.GetValue<string>(r, "Total"),
                        }).ToList()
                    }).ToList();

                return new Response(
                    success: true,
                    debugScript: CommandText.ToString(),
                    message: "Successfully Hi Plus Download answers",
                    body: groupData 
                );
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


        public async Task<Response> GetAnsweredSurveys()
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[HFF].[NSP_SurveyInitialMetrics]");
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", 1); 
                        
                        CommandText.AppendLine("@FLAG=1");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText.ToString(),
                    message: "Successfully fetch aswered surverys",
                    body: dataTable 
                );
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

        public async Task<Response> GetQuestionPercentage()
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[HFF].[NSP_SurveyInitialMetrics]");
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", 0); 
                        
                        CommandText.AppendLine("@FLAG=0");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }

                var groupData = dataTable.Rows.Cast<DataRow>()
                    .GroupBy(row => new
                    {
                        type = DataRowUtils.GetValue<string>(row, "TYPE")
                    })
                    .Select(group => new
                    {
                        type = group.Key.type,
                        items = group.Select(r => new
                        {
                            questionId = DataRowUtils.GetValue<string>(r, "Question_ID"),
                            question = DataRowUtils.GetValue<string>(r, "Question"),
                            percentage = DataRowUtils.GetValue<string>(r, "Percentage")
                        }).ToList()

                    }).ToList();


                return new Response(
                    success: true,
                    debugScript: CommandText.ToString(),
                    message: "Successfully fetch question percentage",
                    body: groupData 
                );
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
