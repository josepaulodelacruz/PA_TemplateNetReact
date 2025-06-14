﻿using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography.Xml;

namespace NetTemplate_React.Models.Reports
{
    public class CrashReport
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("when")]
        public DateTime When { get; set; }

        [JsonProperty("where")]
        public string Where { get; set; }

        [JsonProperty("what")]
        public string What { get; set; }

        [JsonProperty("severity_level")]
        public string SeverityLevel { get; set; }

        [JsonProperty("created_by")]
        public string CreatedBy { get; set; }

        [JsonProperty("lin_id")]
        public int LinId { get; set; }

        [JsonProperty("stack_trace")]
        public string StackTrace { get; set; }

        [JsonProperty("browser")]
        public string Browser { get; set; }

        [JsonProperty("os")]
        public string Os { get; set; }

        [JsonProperty("user_agent")]
        public string UserAgent { get; set; }

        [JsonProperty("scenario")]
        public string Scenario { get; set; }

        [JsonProperty("details")]
        public string Details { get; set; }

        //needed to be ignore
        public List<IFormFile> Images { get; set; }

        [JsonProperty("image_bins")]
        public List<string> ImageBins { get; set; }

        [JsonProperty("image_cover")]
        public string ImageCover { get; set; }

        [JsonProperty("log_id")]
        public int LogId { get; set; }

        [JsonProperty("total_count")]
        public int TotalCount { get; set; }

        [JsonProperty("current_page")]
        public int CurrentPage { get; set; }

        [JsonProperty("total_pages")]
        public int TotalPages { get; set; }


        /// <summary>
        /// Transforms a DataTable to a list of CrashReport objects
        /// </summary>
        /// <param name="dataTable">DataTable containing crash report data</param>
        /// <returns>List of CrashReport objects</returns>
        public static List<CrashReport> TransformCrashReport(DataTable dataTable)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<CrashReport>();

            var crashReports = new List<CrashReport>();

            foreach (DataRow row in dataTable.Rows)
            {
                var crashReport = new CrashReport
                {
                    Id = GetValue<int>(row, "main_id"),
                    When = GetValue<DateTime>(row, "when"),
                    Where = GetValue<string>(row, "where"),
                    What = GetValue<string>(row, "what"),
                    SeverityLevel = GetValue<string>(row, "severity_level"),
                    CreatedBy = GetValue<string>(row, "created_by"),
                    LinId = GetValue<int>(row, "lin_id"),
                    StackTrace = GetValue<string>(row, "stack_trace"),
                    Browser = GetValue<string>(row, "browser"),
                    Os = GetValue<string>(row, "os"),
                    UserAgent = GetValue<string>(row, "user_agent"),
                    Scenario = GetValue<string>(row, "scenario"),
                    Details = GetValue<string>(row, "details"),
                    Images = null,
                    TotalCount = GetValue<int>(row, "totalcount"),
                    CurrentPage = GetValue<int>(row, "currentpage"),
                    TotalPages = GetValue<int>(row, "totalpages"),
                    ImageCover = GetValue<string>(row, "img"),
                    LogId = GetValue<int>(row, "log_id")
                };

                crashReports.Add(crashReport);
            }

            return crashReports;
        }

        // Group crash reports by ID and collect all images into ImageBins array
        public static List<CrashReport> TransformCrashReportWithImage(DataTable dataTable)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<CrashReport>();

            var crashReportsDict = new Dictionary<int, CrashReport>();

            foreach (DataRow row in dataTable.Rows)
            {
                var id = GetValue<int>(row, "id");

                if (!crashReportsDict.ContainsKey(id))
                {
                    // Create new crash report with all properties and empty ImageBins
                    crashReportsDict[id] = new CrashReport
                    {
                        Id = id,
                        When = GetValue<DateTime>(row, "when"),
                        Where = GetValue<string>(row, "where"),
                        What = GetValue<string>(row, "what"),
                        SeverityLevel = GetValue<string>(row, "severity_level"),
                        CreatedBy = GetValue<string>(row, "created_by"),
                        LinId = GetValue<int>(row, "lin_id"),
                        StackTrace = GetValue<string>(row, "stack_trace"),
                        Browser = GetValue<string>(row, "browser"),
                        Os = GetValue<string>(row, "os"),
                        UserAgent = GetValue<string>(row, "user_agent"),
                        Scenario = GetValue<string>(row, "scenario"),
                        Details = GetValue<string>(row, "details"),
                        Images = null,
                        TotalCount = GetValue<int>(row, "totalcount"),
                        CurrentPage = GetValue<int>(row, "currentpage"),
                        TotalPages = GetValue<int>(row, "totalpages"),
                        //ImageCover = GetValue<string>(row, "img"),
                        LogId = GetValue<int>(row, "log_id"),
                        ImageBins = new List<string>()
                    };
                }

                // Add image to the ImageBins array if it exists and isn't already added
                var imageValue = GetValue<string>(row, "img");
                if (!string.IsNullOrEmpty(imageValue) && !crashReportsDict[id].ImageBins.Contains(imageValue))
                {
                    crashReportsDict[id].ImageBins.Add(imageValue);
                }
            }

            return crashReportsDict.Values.ToList();
        }

        /// <summary>
        /// Generic method to safely extract values from DataRow
        /// </summary>
        /// <typeparam name="T">Type to convert to</typeparam>
        /// <param name="row">DataRow containing the data</param>
        /// <param name="columnName">Column name to extract</param>
        /// <param name="defaultValue">Default value if column doesn't exist or is null</param>
        /// <returns>Converted value or default</returns>
        private static T GetValue<T>(DataRow row, string columnName, T defaultValue = default(T))
        {
            try
            {
                if (row.Table.Columns.Contains(columnName) && row[columnName] != DBNull.Value)
                {
                    var value = row[columnName];

                    if (typeof(T) == typeof(string))
                        return (T)(object)value.ToString();

                    if (typeof(T) == typeof(int))
                        return (T)(object)Convert.ToInt32(value);

                    if (typeof(T) == typeof(DateTime))
                        return (T)(object)Convert.ToDateTime(value);

                    if (typeof(T) == typeof(bool))
                        return (T)(object)Convert.ToBoolean(value);

                    return (T)Convert.ChangeType(value, typeof(T));
                }
            }
            catch (Exception ex)
            {
                // Log exception if needed
                Console.WriteLine($"Error converting column '{columnName}': {ex.Message}");
            }

            return defaultValue;
        }

    }

    public class CrashReportIMG
    {
        [JsonProperty("image")]
        public string Image { get; set; }
    }

    public class Metrics
    {
        [JsonProperty("crash_counts")]
        public CrashCounts CrashCounts { get; set; }

        [JsonProperty("line_charts")]
        List<LineChart> LineCharts { get; set; }

        public Metrics TransformCrashReportMetrics (DataTable dataTable)
        {
            var metricsDict = new Dictionary<int, Metrics>();
            var lineChartDict = new Dictionary<DateTime, LineChart>();

            if (dataTable == null || dataTable.Rows.Count == 0)
                return new Metrics();

            foreach (DataRow row in dataTable.Rows)
            {
                var id = GetValue<int>(row, "id");

                var date = GetValue<DateTime>(row, "CrashDate");

                lineChartDict[date] = new LineChart()
                {
                    Date = GetValue<DateTime>(row, "crashDate"),
                    DailyCrashes = GetValue<int>(row, "dailyCrashes"),
                    DailyAffectedUsers = GetValue<int>(row, "dailyAffectedUsers"),
                    DailyCriticalCrashes = GetValue<int>(row, "dailyCriticalCrashes"),
                    CumulativeCrashes = GetValue<int>(row, "cumulativeCrashes"),
                    CumulativeAffectedUsers = GetValue<int>(row, "cumulativeAffectedUsers"),
                    CumulativeCriticalCrashes = GetValue<int>(row, "cumulativeCriticalCrahes"),
                };

                metricsDict[id] = new Metrics()
                {
                    CrashCounts = new CrashCounts()
                    {
                        TotalCrashes = GetValue<int>(row, "totalCrashes"),
                        AffectedUser = GetValue<int>(row, "affectedUsers"),
                        CriticalSystemFailures = GetValue<int>(row, "criticalSystemFailures"),
                        CrashFreeSessions = GetValue<int>(row, "crashFreeSessions"),
                        CrashesPercentChange = GetValue<decimal>(row, "crashesPercentChange"),
                        UsersPercentChange = GetValue<decimal>(row, "usersPercentChange"),
                        CriticalFailuresPercentChange = GetValue<decimal>(row, "criticalFailuresPercentChange"),
                        CrashesFreeSessionsPercentChange = GetValue<decimal>(row, "crashFreeSessionsPercentChange"),
                    },
                    LineCharts = lineChartDict.Values.ToList(),
                };


            }

            return metricsDict[0];
        }

        private static T GetValue<T>(DataRow row, string columnName, T defaultValue = default(T))
        {
            try
            {
                if (row.Table.Columns.Contains(columnName) && row[columnName] != DBNull.Value)
                {
                    var value = row[columnName];

                    if (typeof(T) == typeof(string))
                        return (T)(object)value.ToString();

                    if (typeof(T) == typeof(int))
                        return (T)(object)Convert.ToInt32(value);

                    if (typeof(T) == typeof(DateTime))
                        return (T)(object)Convert.ToDateTime(value);

                    if (typeof(T) == typeof(bool))
                        return (T)(object)Convert.ToBoolean(value);

                    return (T)Convert.ChangeType(value, typeof(T));
                }
            }
            catch (Exception ex)
            {
                // Log exception if needed
                Console.WriteLine($"Error converting column '{columnName}': {ex.Message}");
            }

            return defaultValue;
        }

    }

    public class LineChart
    {
        [JsonProperty("date")]
        public DateTime Date { get; set; }

        [JsonProperty("daily_crashes")]
        public int DailyCrashes { get; set; }

        [JsonProperty("daily_affected_users")]
        public int DailyAffectedUsers { get; set; }

        [JsonProperty("daily_critical_crashes")]
        public int DailyCriticalCrashes { get; set; }

        [JsonProperty("cumulative_crashes")]
        public int CumulativeCrashes { get; set; }

        [JsonProperty("cumulative_affected_users")]
        public int CumulativeAffectedUsers { get; set; }

        [JsonProperty("cumulative_critical_crashes")]
        public int CumulativeCriticalCrashes { get; set; }

    }

    public class CrashCounts
    {
        [JsonProperty("total_crashes")]
        public int TotalCrashes { get; set; }

        [JsonProperty("affected_users")]
        public int AffectedUser { get; set; }

        [JsonProperty("critical_system_failures")]
        public int CriticalSystemFailures { get; set; }

        [JsonProperty("crash_free_sessions")]
        public int CrashFreeSessions { get; set; }

        [JsonProperty("crashes_percent_change")]
        public decimal CrashesPercentChange { get; set; }

        [JsonProperty("users_percent_change")]
        public decimal UsersPercentChange { get; set; }

        [JsonProperty("critical_failures_percent_change")]
        public decimal CriticalFailuresPercentChange { get; set; }

        [JsonProperty("crashes_free_sessioins_percent_change")]
        public decimal CrashesFreeSessionsPercentChange { get; set; }

    }
}
