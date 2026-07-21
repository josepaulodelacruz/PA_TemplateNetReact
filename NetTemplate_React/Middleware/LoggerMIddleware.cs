using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json.Linq;

namespace NetTemplate_React.Middleware
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class LoggerMIddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;
        private readonly string _connectionString;
        private readonly bool _isLive;

        public LoggerMIddleware(RequestDelegate next, ILoggerFactory loggerFactory, IConfiguration configuration)
        {
            _logger = loggerFactory.CreateLogger<LoggerMIddleware>();
            _isLive = bool.Parse(configuration.GetConnectionString("IsLive")) == true ? true : false;

            _connectionString = !_isLive ? configuration.GetConnectionString("DEV") : configuration.GetConnectionString("PROD");

            //_connectionString = configuration.GetConnectionString("DEV") ?? throw new InvalidOperationException("Connection string 'DEV' not found in configuration");
            //_connectionString = configuration.GetConnectionString("PROD") ?? throw new InvalidOperationException("Connection string 'DEV' not found in configuration");
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            Debug.WriteLine("Attempting to log..");

            if(!httpContext.User.Identity.IsAuthenticated)
            {
                await _next(httpContext);
                return;
            }

            // Only process API requests
            if (!httpContext.Request.Path.StartsWithSegments("/api") || httpContext.Request.Path.StartsWithSegments("/api/UserHistory"))
            {
                await _next(httpContext);
                return;
            }

            // Skip logging OPTIONS requests
            if (httpContext.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase) || httpContext.Request.Path.StartsWithSegments("/api/Projects/SubdividedTableView/export"))
            {
                await _next(httpContext);
                return;
            }


            var stopwatch = Stopwatch.StartNew();
            var originalBodyStream = httpContext.Response.Body;

            // Create a new memory stream to capture the response
            using (var responseBody = new MemoryStream())
            {
                // Replace the context response body with our memory stream
                httpContext.Response.Body = responseBody;

                try
                {
                    // Execute the next middleware in the pipeline
                    await _next(httpContext);

                    // Get the response details
                    stopwatch.Stop();
                    
                    // Read the response body
                    responseBody.Seek(0, SeekOrigin.Begin);
                    var responseBodyText = await new StreamReader(responseBody).ReadToEndAsync();

                    // Create log entry
                    var logEntry = new LogEntry
                    {
                        Timestamp = DateTime.UtcNow,
                        Message = "API Response captured",
                        RequestPath = httpContext.Request.Path.Value,
                        RequestMethod = httpContext.Request.Method,
                        Body = responseBodyText,
                        ResponseStatusCode = httpContext.Response.StatusCode,
                        Duration = stopwatch.ElapsedMilliseconds,
                        UserId = GetUserId(httpContext)
                    };

                    // Log to database (fire and forget)
                    //_ = Task.Run(() => LogToDatabaseAsync(logEntry));
                    int? referenceId = await LogToDatabaseAsync(logEntry);

                    // Add reference ID to response headers
                    //var jsonObject = Newtonsoft.Json.Linq.JObject.Parse(responseBodyText);
                    var jsonObject =  JObject.Parse(responseBodyText);

                    jsonObject["reference_id"] = referenceId;

                    // Serialize it back to string
                    var modifiedResponse = jsonObject.ToString(Newtonsoft.Json.Formatting.None);

                    // Write the modified response back to the original stream
                    httpContext.Response.Body = originalBodyStream;
                    httpContext.Response.ContentLength = Encoding.UTF8.GetByteCount(modifiedResponse);
                    await httpContext.Response.WriteAsync(modifiedResponse);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in LoggerMiddleware");
                    throw;
                }
                finally
                {
                    // Restore the original response body stream
                    httpContext.Response.Body = originalBodyStream;
                }
            }
        }

        private string GetUserId(HttpContext httpContext)
        {
            // Try to get user ID from various sources
            if (httpContext.User?.Identity?.IsAuthenticated == true)
            {
                // Try to get from claims
                var userIdClaim = httpContext.User.FindFirst("sub") ?? 
                                 httpContext.User.FindFirst("id") ?? 
                                 httpContext.User.FindFirst("userId") ??
                                 httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                
                if (userIdClaim != null)
                    return userIdClaim.Value;
                
                // Fallback to username
                return httpContext.User.Identity.Name;
            }

            // Try to get from headers
            if (httpContext.Request.Headers.ContainsKey("X-User-Id"))
            {
                return httpContext.Request.Headers["X-User-Id"].ToString();
            }

            return null;
        }

        private async Task<int?> LogToDatabaseAsync(LogEntry logEntry)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(_connectionString))
                {
                    await con.OpenAsync();
                    var commandText = new StringBuilder();
                    commandText.AppendLine("INSERT INTO APILogs");
                    commandText.AppendLine("(Timestamp, Message, RequestPath, RequestMethod, Body, ResponseStatusCode, Duration, UserId)");
                    commandText.AppendLine("VALUES");
                    commandText.AppendLine("(@Timestamp, @Message, @RequestPath, @RequestMethod, @Body, @ResponseStatusCode, @Duration, @UserId)");
                    commandText.AppendLine("SELECT CAST(SCOPE_IDENTITY() AS INT);");

                    using (SqlCommand cmd = new SqlCommand(commandText.ToString(), con))
                    {
                        cmd.Parameters.AddWithValue("@Timestamp", logEntry.Timestamp);
                        cmd.Parameters.AddWithValue("@Message", (object)logEntry.Message ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@RequestPath", (object)logEntry.RequestPath ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@RequestMethod", (object)logEntry.RequestMethod ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Body", (object)logEntry.Body ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ResponseStatusCode", (object)logEntry.ResponseStatusCode ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Duration", (object)logEntry.Duration ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@UserId", (object)logEntry.UserId ?? DBNull.Value);

                        var result = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
                        return result != null ? (int?)Convert.ToInt32(result) : null;
                    }
                }


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging to database");
                return null;
            }
        }
    }

    // Extension method used to add the middleware to the HTTP request pipeline.
    public static class LoggerMIddlewareExtensions
    {
        public static IApplicationBuilder UseLoggerMIddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<LoggerMIddleware>();
        }
    }

    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Message { get; set; }
        public string RequestPath { get; set; }
        public string RequestMethod { get; set; }
        public string Body { get; set; }
        public int? ResponseStatusCode { get; set; }
        public long? Duration { get; set; }
        public string UserId { get; set; }
    }
}
