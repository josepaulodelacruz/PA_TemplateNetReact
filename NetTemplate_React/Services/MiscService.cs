using Microsoft.CodeAnalysis.CSharp.Syntax;
using NetTemplate_React.Models;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Threading.Tasks;

namespace NetTemplate_React.Services
{
    public interface IMiscService
    {
        #region Home Buyer feedback form 
        Task<Response> GetAccountStageStatus();
        #endregion

    }
    public class MiscService : IMiscService 
    {
        private string _conString;

        public MiscService(string conString) { _conString = conString; }

        #region Home Buyer feedback form
        public async Task<Response> GetAccountStageStatus()
        {
            try
            {
                var dataTable = new DataTable();
                StringBuilder CommandText = new StringBuilder();
                CommandText.Append("" +
                    "SELECT [ID], [TITLE], [DESCRIPTION] " +
                    "FROM [HFF].[ActionTakenStage]");

                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully fetches account taken stage status",
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
        

        #endregion

    }
}
