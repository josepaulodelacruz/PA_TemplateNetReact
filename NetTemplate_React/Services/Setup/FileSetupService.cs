using NetTemplate_React.Models;
using NetTemplate_React.Models.Setup;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace NetTemplate_React.Services.Setup
{
    public interface IFileSetupService
    {
        Task<Response> GetLabels();

        Task<Response> GetDocuments();

        Task<Response> SaveDocument(DocumentFile document, string userName);

        Task<Response> GetSchemes();

        Task<Response> GetMatrixLookups();

        Task<Response> GetMatrix(string financingScheme);

        Task<Response> GetUnmappedDocuments(string financingScheme);

        Task<Response> SaveMatrixRow(string financingScheme, MatrixChecklistRow row, string userName);

        Task<Response> DeleteMatrixRow(int rowId, string userName);
    }

    public class FileSetupService : IFileSetupService
    {
        private readonly string _conString;

        string CommandText = "[DOC].[NSP_ManageFileRequirements]";

        /*THE MATRIX TAB IS A PROC OF ITS OWN - THE DOCUMENTS AND THE MAPPING ARE SEPARATE SCREENS*/
        const string MatrixCommandText = "[DOC].[NSP_ManageMatrixSchemeChecklist]";

        public FileSetupService(string conString)
        {
            _conString = conString;
        }

        public async Task<Response> GetLabels()
        {
            var dataTable = new DataTable();
            try {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "GET LABELS");

                        using (SqlDataReader reader = await  cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        foreach (DataColumn col in dataTable.Columns)
                        {
                            col.ColumnName = col.ColumnName.ToLower();
                        }
                    }

                    return new Response(
                        success: true,
                        debugScript: CommandText,
                        message: "Successfully fetch labels",
                        body: dataTable 
                    );
                }

            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace
                );
            }

        }

        /// <summary>
        /// Every active document with the document type it belongs to. The client groups
        /// them into the tabs, so the whole set is returned in one go.
        /// </summary>
        public async Task<Response> GetDocuments()
        {
            var dataTable = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "GET DOCUMENT FILES");

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully fetch documents",
                    body: DocumentFile.TransformDocuments(dataTable)
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace
                );
            }
        }

        /// <summary>
        /// Inserts when <see cref="DocumentFile.Id"/> is 0, updates that row otherwise -
        /// 'CREATE/UPDATE FILE DOCUMENT' decides on the same @FILE_ID.
        /// </summary>
        public async Task<Response> SaveDocument(DocumentFile document, string userName)
        {
            if (document == null || string.IsNullOrWhiteSpace(document.Title))
            {
                return Failed(message: "Document is required");
            }

            if (document.LabelId <= 0)
            {
                return Failed(message: "Document type is required");
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "CREATE/UPDATE FILE DOCUMENT");
                        cmd.Parameters.AddWithValue("@FILE_ID", document.Id);
                        cmd.Parameters.AddWithValue("@TITLE", document.Title.Trim());
                        cmd.Parameters.AddWithValue("@LABEL_ID", document.LabelId);
                        cmd.Parameters.AddWithValue("@USER", (object)userName ?? DBNull.Value);

                        object result = await cmd.ExecuteScalarAsync();

                        if (result != null && result != DBNull.Value)
                            document.Id = Convert.ToInt32(result);
                    }
                }

                document.Title = document.Title.Trim();

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully saved document",
                    body: document
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace
                );
            }
        }

        /// <summary>
        /// The financing schemes of the matrix screen - one per tab of the workbook.
        /// </summary>
        public async Task<Response> GetSchemes()
        {
            return await ReadMatrixTable("GET SCHEMES", "Successfully fetch financing schemes");
        }

        /// <summary>
        /// Every select of the matrix row form in one call, keyed by GROUP_CODE -
        /// SCANNED_COPY, DUE_DATE, MILESTONE, EXPIRY and SOURCE.
        /// </summary>
        public async Task<Response> GetMatrixLookups()
        {
            return await ReadMatrixTable("GET LOOKUPS", "Successfully fetch matrix lookups");
        }

        private async Task<Response> ReadMatrixTable(string flag, string message)
        {
            var dataTable = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(MatrixCommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", flag);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        foreach (DataColumn col in dataTable.Columns)
                        {
                            col.ColumnName = col.ColumnName.ToLower();
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: MatrixCommandText,
                    message: message,
                    body: dataTable
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace,
                    commandText: MatrixCommandText
                );
            }
        }

        /// <summary>
        /// The matrix of one financing scheme - the columns, the document rows and the
        /// ticked cells, as the four result sets of 'GET CHECKLIST'. The client joins
        /// them in memory, so nothing is repeated over the wire.
        /// </summary>
        public async Task<Response> GetMatrix(string financingScheme)
        {
            if (string.IsNullOrWhiteSpace(financingScheme))
            {
                return Failed(message: "Financing scheme is required", commandText: MatrixCommandText);
            }

            var dataSet = new DataSet();

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(MatrixCommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "GET CHECKLIST");
                        cmd.Parameters.AddWithValue("@SCHEME_CODE", financingScheme.Trim());

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            /*THE FOUR SETS ARRIVE IN A FIXED ORDER - SCHEME, COLUMNS, ROWS, CELLS*/
                            dataSet.Load(reader, LoadOption.OverwriteChanges, "scheme", "columns", "rows", "cells");
                        }
                    }
                }

                foreach (DataTable table in dataSet.Tables)
                {
                    /*THE CLIENT READS SNAKE CASE, THE PROC RETURNS THE COLUMN NAMES UPPER CASE*/
                    foreach (DataColumn col in table.Columns)
                    {
                        col.ColumnName = col.ColumnName.ToLower();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: MatrixCommandText,
                    message: "Successfully fetch matrix",
                    body: new MatrixChecklist
                    {
                        Scheme = TableAt(dataSet, 0),
                        Columns = TableAt(dataSet, 1),
                        Rows = TableAt(dataSet, 2),
                        Cells = TableAt(dataSet, 3),
                    }
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace,
                    commandText: MatrixCommandText
                );
            }
        }

        /*A SCHEME WITH NO DOCUMENT MAPPED YET RETURNS FEWER TABLES, NOT AN ERROR*/
        private static DataTable TableAt(DataSet dataSet, int index)
        {
            return index < dataSet.Tables.Count ? dataSet.Tables[index] : null;
        }

        /// <summary>
        /// The documents not on this scheme's checklist yet - what the 'add document'
        /// picker offers.
        /// </summary>
        public async Task<Response> GetUnmappedDocuments(string financingScheme)
        {
            if (string.IsNullOrWhiteSpace(financingScheme))
            {
                return Failed(message: "Financing scheme is required", commandText: MatrixCommandText);
            }

            var dataTable = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(MatrixCommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "GET UNMAPPED DOCUMENTS");
                        cmd.Parameters.AddWithValue("@SCHEME_CODE", financingScheme.Trim());

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }

                        foreach (DataColumn col in dataTable.Columns)
                        {
                            col.ColumnName = col.ColumnName.ToLower();
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: MatrixCommandText,
                    message: "Successfully fetch unmapped documents",
                    body: dataTable
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace,
                    commandText: MatrixCommandText
                );
            }
        }

        /// <summary>
        /// Inserts when <see cref="MatrixChecklistRow.Id"/> is 0, updates that row
        /// otherwise. The checkboxes travel with it and the proc rebuilds them, so a
        /// cleared box is a real 'no' rather than a cell left behind.
        /// </summary>
        public async Task<Response> SaveMatrixRow(string financingScheme, MatrixChecklistRow row, string userName)
        {
            if (string.IsNullOrWhiteSpace(financingScheme))
            {
                return Failed(message: "Financing scheme is required", commandText: MatrixCommandText);
            }

            if (row == null || row.FileId <= 0)
            {
                return Failed(message: "Document is required", commandText: MatrixCommandText);
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(MatrixCommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "SAVE CHECKLIST ROW");
                        cmd.Parameters.AddWithValue("@SCHEME_CODE", financingScheme.Trim());
                        cmd.Parameters.AddWithValue("@HDR_ID", row.Id);
                        cmd.Parameters.AddWithValue("@FILE_ID", row.FileId);
                        cmd.Parameters.AddWithValue("@SEQ_NO", DbValue(row.SeqNo));
                        cmd.Parameters.AddWithValue("@CONDITION_TEXT", DbValue(row.ConditionText));
                        cmd.Parameters.AddWithValue("@SCANNED_COPY_ID", DbValue(row.ScannedCopyId));
                        cmd.Parameters.AddWithValue("@DUE_DATE_ID", DbValue(row.DueDateId));
                        cmd.Parameters.AddWithValue("@MILESTONE_ID", DbValue(row.MilestoneId));
                        cmd.Parameters.AddWithValue("@EXPIRY_ID", DbValue(row.ExpiryId));
                        cmd.Parameters.AddWithValue("@SOURCE_ID", DbValue(row.SourceId));
                        cmd.Parameters.AddWithValue("@IS_REQUIRED_FOR_COMMISSION", DbValue(row.IsRequiredForCommission));
                        cmd.Parameters.AddWithValue("@REMARKS", DbValue(row.Remarks));
                        cmd.Parameters.AddWithValue("@USER", DbValue(userName));

                        /*THE TVP BINDS ON COLUMN ORDER, WHICH ToCellTable() BUILDS TO MATCH*/
                        var cells = new SqlParameter("@CELLS", SqlDbType.Structured)
                        {
                            TypeName = "[UDT].[DocMatrixCell]",
                            Value = row.ToCellTable(),
                        };

                        cmd.Parameters.Add(cells);

                        object result = await cmd.ExecuteScalarAsync();

                        if (result != null && result != DBNull.Value)
                            row.Id = Convert.ToInt32(result);
                    }
                }

                return new Response(
                    success: true,
                    debugScript: MatrixCommandText,
                    message: "Successfully saved checklist row",
                    body: row
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace,
                    commandText: MatrixCommandText
                );
            }
        }

        /// <summary>
        /// Soft deletes the row. The ticks stay behind, so adding the document back to
        /// the scheme is a fresh row rather than a resurrection.
        /// </summary>
        public async Task<Response> DeleteMatrixRow(int rowId, string userName)
        {
            if (rowId <= 0)
            {
                return Failed(message: "Checklist row is required", commandText: MatrixCommandText);
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(_conString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(MatrixCommandText, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 0;

                        cmd.Parameters.AddWithValue("@FLAG", "DELETE CHECKLIST ROW");
                        cmd.Parameters.AddWithValue("@HDR_ID", rowId);
                        cmd.Parameters.AddWithValue("@USER", DbValue(userName));

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: MatrixCommandText,
                    message: "Successfully removed checklist row",
                    body: rowId
                );
            }
            catch (Exception Ex)
            {
                return Failed(
                    message: Ex.Message,
                    stackTrace: Ex.StackTrace,
                    commandText: MatrixCommandText
                );
            }
        }

        /*AddWithValue() SENDS A CLR NULL AS 'NO PARAMETER AT ALL', SO IT HAS TO BE DBNull*/
        private static object DbValue(object value)
        {
            if (value == null) return DBNull.Value;

            var text = value as string;

            return string.IsNullOrWhiteSpace(text) && text != null ? DBNull.Value : value;
        }

        private Response Failed(string message = null, string stackTrace = null, string commandText = null)
        {
            return new Response(
                success: false,
                debugScript: commandText ?? CommandText,
                message: message,
                body: stackTrace
            );

        }
    }
}
