using Microsoft.Extensions.Configuration;
using NetTemplate_React.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NetTemplate_React.Services.Setup
{
    public interface IUserService
    {
        Task<Response> GetUsers(string id = null);

        Task<Response> ChangeUserStatus(int id, bool isActive);

        Task<Response> SearchUser(string search);

        Task<Response> GetEmployees();

        Task<Response> AddEmployee(string username);

    }

    public class UserService : IUserService
    {
        private readonly string _conString;
        private readonly IConfiguration _configuration;

        public UserService(string conString, IConfiguration configuration)
        {
            _conString = conString;
            _configuration = configuration; 
        }

        public async Task<Response> GetUsers(string id = null)
        {
            //string commandText = "SELECT [ID],[USERNAME],[ROLE] FROM USERS WHERE @ID IS NULL OR ID = @ID";
            string commandText = @"
                SELECT usr.*, latest.[SESSION_DATE]
                FROM [dbo].[USERS] usr
                OUTER APPLY (
                    SELECT TOP 1 ss.[SESSION_DATE] 
                    FROM [dbo].[UserSessions] ss 
                    WHERE ss.[USER_ID] = usr.[ID] 
                    ORDER BY ss.[SESSION_DATE] DESC
                ) latest
                WHERE (@SEARCH IS NULL OR @SEARCH = '') 
                    OR usr.[USERNAME] LIKE '%' + @SEARCH + '%' 
                    OR usr.[ROLE] LIKE '%' + @SEARCH + '%' 
                    OR CAST(usr.[ID] AS VARCHAR(120)) LIKE '%' + @SEARCH + '%'
            ";

            List<User> Users = new List<User>();
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(commandText.ToString(), con))
                    {
                        cmd.Parameters.AddWithValue("@SEARCH", (object)id ?? DBNull.Value);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                User user = new User()
                                {
                                    Id = int.Parse(reader["ID"].ToString()),
                                    Username = reader["USERNAME"].ToString(),
                                    Role = reader["ROLE"].ToString(),
                                    SessionDate = reader.IsDBNull(reader.GetOrdinal("SESSION_DATE"))
                                        ? (DateTime?)null
                                        : reader.GetDateTime(reader.GetOrdinal("SESSION_DATE")),
                                    IsActive = reader.GetBoolean(reader.GetOrdinal("IS_ACTIVE"))
                                };
                                Users.Add(user);
                            }
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: commandText.ToString(),
                    message: "Successfully fetch users",
                    body: Users
                );
            } 
            catch (SqlException Ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText.ToString(),
                    message: Ex.Message,
                    body: null
                )
                {
                    IsCrash = true,
                };
            }
            catch (Exception Ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: Ex.Message,
                    body: null
                );
            }
        } 

        public async Task<Response> ChangeUserStatus(int id, bool isActive = true)
        {
            var commandText = new StringBuilder();
            commandText.AppendLine("UPDATE USERS");
            commandText.AppendLine("SET");
            commandText.AppendLine("IS_ACTIVE = @IsActive");
            commandText.AppendLine("WHERE ID = @ID");
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();
                    using (SqlCommand cmd = new SqlCommand(commandText.ToString(), con))
                    {
                        cmd.Parameters.AddWithValue("@IsActive", isActive);
                        cmd.Parameters.AddWithValue("@ID", id);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: commandText.ToString(),
                    message: "Succesfully updated user status",
                    body: null
                );

            }
            catch (SqlException Ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText.ToString(),
                    message: Ex.Message,
                    body: null
                );
            }
            catch (Exception Ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText.ToString(),
                    message: Ex.Message,
                    body: null
                );
            }
        }

        public async Task<Response> SearchUser(string search = "")
        {
            var dataTable = new DataTable();
            string commandText = "" +
                "SELECT " +
                "[ID]," +
                "[USERNAME]," +
                "[ROLE] " +
                "FROM [USERS] " +
                "WHERE " +
                "(@SEARCH IS NULL OR @SEARCH = '') OR " + 
                "[USERNAME] LIKE @SEARCH OR [ROLE] LIKE @SEARCH";

            using (SqlConnection con = new SqlConnection(_conString))
            {
                await con.OpenAsync();

                List<User> Users = new List<User>();
                using (SqlCommand cmd = new SqlCommand(commandText, con))
                {
                    try
                    {

                        cmd.Parameters.AddWithValue("@SEARCH", "%" + search + "%");

                        using(SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                User user = new User
                                {
                                    Id = int.Parse(reader["ID"].ToString()),
                                    Username = reader["USERNAME"].ToString(),
                                    Role = reader["ROLE"].ToString(),
                                };

                                Users.Add(user);
                            }

                        }

                        return new Response(

                            success: true,
                            debugScript: commandText,
                            message: "Successfully fetch user.",
                            body: Users
                        );
                    }
                    catch (SqlException Ex)
                    {
                        return new Response(
                            success: false,
                            debugScript: commandText,
                            message: Ex.Message,
                            body: null
                        )
                        {
                            IsCrash = true
                        };
                    }
                    catch (Exception Ex)
                    {
                        return new Response(
                            success: false,
                            debugScript: commandText,
                            message: Ex.Message,
                            body: null
                        );
                    }
                }
            }
        }

        public async Task<Response> GetEmployees()
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[STP].[NSP_Users]");

            using (SqlConnection con = new SqlConnection(_conString))
            {
                try
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FLAG", 0);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        CommandText.Append("@FLAG=0");

                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully fetch employeees",
                            body: dataTable
                        );
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

        public async Task<Response> AddEmployee(string username)
        {
            var dataTable = new DataTable();
            StringBuilder CommandText = new StringBuilder();
            CommandText.Append("[STP].[NSP_Users]");

            using (SqlConnection con = new SqlConnection(_conString))
            {
                try
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText.ToString(), con))
                    {
                        cmd.CommandTimeout = 0;
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@FLAG", 1);
                        cmd.Parameters.AddWithValue("@USERNAME", username);

                        await cmd.ExecuteNonQueryAsync();

                        CommandText.Append("@FLAG=0, @USERNAME=" + username);

                        return new Response(
                            success: true,
                            debugScript: CommandText.ToString(),
                            message: "Successfully add access",
                            body: dataTable
                        );
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
}
