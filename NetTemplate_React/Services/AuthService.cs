using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NetTemplate_React.Models;
using System;
using System.Data;
using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace NetTemplate_React.Services
{
    public interface IAuthService
    {
        Task<Response> Test();

        Task<Response> Register(User user);

        Task<Response> Login(User user);
        Task<Response> GenerateSession(User user);


    }

    public class AuthService : IAuthService
    {
        private readonly string _conString; 
        private readonly IConfiguration _configuration;

        public AuthService (string conString, IConfiguration configuration) 
        {
            _conString = conString;
            _configuration = configuration;
        }

        public async Task<Response> Test()
        {
            try
            {
                var dataTable = new DataTable();
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    string commandText =
                        "Select" +
                        "*" +
                        "FROM USERS"; // Adjust column names as needed

                    using (SqlCommand cmd = new SqlCommand(commandText, con))
                    {
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }

                    var response = new Response(
                         success: true,
                         debugScript: commandText,
                         message: "Success",
                         body: dataTable
                     );

                    return response;
                }
            } catch (Exception ex)
            {
                return new Response
                    (
                        success: false,
                        debugScript: "ERROR",
                        message: ex.Message,
                        body: null
                    );
            }
        }

        public async Task<Response> Register(Models.User user)
        {
            var commandText = "INSERT INTO Users ([USERNAME], [PASSWORD]) VALUES (@username, @password)";

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(commandText, con))
                    {
                        cmd.Parameters.AddWithValue("@username", user.Username);
                        cmd.Parameters.AddWithValue("@password", user.Password); // Consider hashing passwords before inserting

                        int rowsAffected = await cmd.ExecuteNonQueryAsync();

                        if (rowsAffected > 0)
                        {
                            return new Response(
                                success: true,
                                debugScript: commandText,
                                message: "User registered successfully.",
                                body: new { Username = user.Username }
                            );
                        }
                        else
                        {
                            return new Response(
                                success: false,
                                debugScript: commandText,
                                message: "User registration failed.",
                                body: null
                            );
                        }
                    }
                }
            }
            catch (SqlException ex)
            {

                if (ex.Number == 2627) // SQL Error Code for UNIQUE constraint violation
                {
                    return new Response(
                        success: false,
                        debugScript: commandText,
                        message: "Duplicate entry detected: The username already exists.",
                        body: null
                    );
                }

                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"SQL Error: {ex.Message}",
                    body: null
                );
            }
            catch (Exception ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"Error: {ex.Message}",
                    body: null
                );
            }
        }

        public async Task<Response> Login(Models.User user)
        {
            var dataTable = new DataTable();
            var commandText = "[dbo].[NSP_Login]";
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();
                    using (SqlCommand cmd = new SqlCommand(commandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@username", user.Username);
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        var token = GenerateJwtToken(dataTable.Rows[0]);
                        // Create response data with user info and token
                        var responseData = User.TransformUser(dataTable);
                        responseData.Token = token;

                        return new Response(
                            success: true,
                            debugScript: commandText,
                            message: "Successfully Logged in",
                            body: responseData
                        );
                    }
                }
            }
            catch (SqlException ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"SQL Error: {ex.Message}",
                    body: null
                );
            }
            catch (Exception ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"Error: {ex.Message}",
                    body: null
                );
            }
        }

        public async Task<Response> GenerateSession(User user)
        {
            var commandText = "insert into UserSessions([USER_ID])\r\nVALUES (@USER_ID)\r\n";

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(commandText, con))
                    {
                        cmd.Parameters.AddWithValue("@USER_ID", user.Id);

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: commandText,
                    message: "Successfully created user session",
                    body: null
                );
            }
            catch (SqlException ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"SQL Error: {ex.Message}",
                    body: null
                );
            }
            catch (Exception ex)
            {
                return new Response(
                    success: false,
                    debugScript: commandText,
                    message: $"Error: {ex.Message}",
                    body: null
                );
            }
        }

        private string GenerateJwtToken(DataRow user)
        {
            // Get JWT settings from configuration
            var secretKey = _configuration["JwtSettings:SecretKey"];
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];

            // Get expiry minutes from config or use default of 60 minutes
            int expiryMinutes = 60;
            if (int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out int configExpiryMinutes))
            {
                expiryMinutes = configExpiryMinutes;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create claims
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user["ID"].ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user["USERNAME"].ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                // You can add more claims here as needed, such as roles
                // Example: new Claim(ClaimTypes.Role, user["ROLE"].ToString())
            };

            // Create the token
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            // Return the serialized token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
