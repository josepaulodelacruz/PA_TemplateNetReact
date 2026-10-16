using Microsoft.Extensions.Configuration;
using NetTemplate_React.Models;
using NetTemplate_React.Models.Setup;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace NetTemplate_React.Services.Setup
{
    public interface IDocumentSetupService
    {
        Task<Response> GetCategories(int page = 1, int pageSize = 10, string search = "");

        Task<Response> GetCategoryById(int id);

        Task<Response> GetSubCategories(int mainId);

        Task<Response> GetOptions(int? mainId = null, int? subId = null);

        Task<Response> CreateCategory(DocumentCategory category, long? createdBy);

        Task<Response> UpdateCategory(int id, DocumentCategory category, long? createdBy);

        Task<Response> CreateSubCategory(int mainId, DocumentSubCategory subCategory, long? createdBy);

        Task<Response> DeleteCategory(int id);

        Task<Response> CreateOption(DocumentOption option);

        Task<Response> DeleteSubCategory(int subId);

        Task<Response> DeleteOption(int optionId);
    }

    public class DocumentSetupService : IDocumentSetupService
    {
        private const string CommandText = "[DOC].[NSP_DocumentSetup]";

        private readonly string _conString;
        private readonly IConfiguration _config;

        public DocumentSetupService(string conString, IConfiguration config)
        {
            _conString = conString;
            _config = config;
        }

        public async Task<Response> GetCategories(int page = 1, int pageSize = 10, string search = "")
        {
            var dataTable = new DataTable();

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "GET CATEGORIES");
                        cmd.Parameters.AddWithValue("@SEARCH", search ?? string.Empty);
                        cmd.Parameters.AddWithValue("@PageNumber", page);
                        cmd.Parameters.AddWithValue("@PageSize", pageSize);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully fetch document categories",
                    body: DocumentCategory.TransformCategories(dataTable)
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> GetCategoryById(int id)
        {
            var main = new DataTable();
            var subs = new DataTable();
            var options = new DataTable();

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "GET CATEGORY BY ID");
                        cmd.Parameters.AddWithValue("@MAIN_ID", id);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            /*THE PROC RETURNS 3 RESULT SETS: MAIN, SUB CATEGORIES, OPTIONS*/
                            main = await ReadTableAsync(reader);

                            if (await reader.NextResultAsync())
                                subs = await ReadTableAsync(reader);

                            if (await reader.NextResultAsync())
                                options = await ReadTableAsync(reader);
                        }
                    }
                }

                DocumentCategory category = DocumentCategory.TransformCategory(main, subs, options);

                if (category == null)
                {
                    return new Response(
                        success: false,
                        debugScript: CommandText,
                        message: "Category not found",
                        body: null
                    );
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully fetch document category",
                    body: category
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> GetSubCategories(int mainId)
        {
            var dataTable = new DataTable();
            var options = new DataTable();

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "GET SUB CATEGORIES");
                        cmd.Parameters.AddWithValue("@MAIN_ID", mainId);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            /*THE PROC RETURNS 2 RESULT SETS: SUB CATEGORIES, THEN THEIR OPTIONS*/
                            dataTable = await ReadTableAsync(reader);

                            if (await reader.NextResultAsync())
                                options = await ReadTableAsync(reader);
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully fetch sub-categories",
                    body: DocumentSubCategory.TransformSubCategories(dataTable, options)
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> GetOptions(int? mainId = null, int? subId = null)
        {
            var dataTable = new DataTable();

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "GET OPTIONS");
                        cmd.Parameters.AddWithValue("@MAIN_ID", (object)mainId ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@SUB_ID", (object)subId ?? DBNull.Value);

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dataTable.Load(reader);
                        }
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully fetch options",
                    body: DocumentOption.TransformOptions(dataTable)
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> CreateCategory(DocumentCategory category, long? createdBy)
        {
            return await SaveCategory("CREATE CATEGORY", null, category, createdBy, "Successfully created document category");
        }

        public async Task<Response> UpdateCategory(int id, DocumentCategory category, long? createdBy)
        {
            return await SaveCategory("UPDATE CATEGORY", id, category, createdBy, "Successfully updated document category");
        }

        /// <summary>
        /// Adds one sub-category to an existing category. UPDATE CATEGORY rebuilds the whole
        /// set, which would reissue every sibling's id, so a single insert gets its own flag.
        /// </summary>
        public async Task<Response> CreateSubCategory(int mainId, DocumentSubCategory subCategory, long? createdBy)
        {
            if (subCategory == null || string.IsNullOrWhiteSpace(subCategory.Name))
            {
                return new Response(
                    success: false,
                    debugScript: CommandText,
                    message: "Sub-category name is required",
                    body: null
                );
            }

            var dtOptions = new DataTable();
            dtOptions.Columns.Add("ROW_KEY", typeof(int));
            dtOptions.Columns.Add("LABEL", typeof(string));

            if (subCategory.Options != null)
            {
                foreach (string option in subCategory.Options)
                {
                    if (string.IsNullOrWhiteSpace(option)) continue;

                    dtOptions.Rows.Add(new object[] { DBNull.Value, option.Trim() });
                }
            }

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "CREATE SUB CATEGORY");
                        cmd.Parameters.AddWithValue("@MAIN_ID", mainId);
                        cmd.Parameters.AddWithValue("@NAME", subCategory.Name.Trim());
                        cmd.Parameters.AddWithValue("@OPTION_TYPE", (object)subCategory.Type ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@CREATED_BY", (object)createdBy ?? DBNull.Value);

                        cmd.Parameters.Add(new SqlParameter("@OPTIONS", SqlDbType.Structured)
                        {
                            TypeName = "[UDT].[DocOption]",
                            Value = dtOptions
                        });

                        object result = await cmd.ExecuteScalarAsync();

                        if (result != null && result != DBNull.Value)
                            subCategory.Id = Convert.ToInt32(result);
                    }
                }

                subCategory.MainId = mainId;

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully created sub-category",
                    body: subCategory
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        /// <summary>
        /// Adds one option to a category or to a sub-category. The proc rejects a payload
        /// that names both parents or neither, so the caller does not have to.
        /// </summary>
        public async Task<Response> CreateOption(DocumentOption option)
        {
            if (option == null || string.IsNullOrWhiteSpace(option.Label))
            {
                return new Response(
                    success: false,
                    debugScript: CommandText,
                    message: "Option is required",
                    body: null
                );
            }

            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "CREATE OPTION");
                        cmd.Parameters.AddWithValue("@MAIN_ID", (object)option.MainCategoryId ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@SUB_ID", (object)option.SubCategoryId ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@LABEL", option.Label.Trim());

                        object result = await cmd.ExecuteScalarAsync();

                        if (result != null && result != DBNull.Value)
                            option.Id = Convert.ToInt32(result);
                    }
                }

                option.Label = option.Label.Trim();
                option.IsActive = true;

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully created option",
                    body: option
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> DeleteCategory(int id)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "DELETE CATEGORY");
                        cmd.Parameters.AddWithValue("@MAIN_ID", id);

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully deleted document category",
                    body: id
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        public async Task<Response> DeleteSubCategory(int subId)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "DELETE SUB CATEGORY");
                        cmd.Parameters.AddWithValue("@SUB_ID", subId);

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully deleted sub-category",
                    body: subId
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        /// <summary>
        /// Soft deletes one option. The proc refuses to remove the last active option of a
        /// category or sub-category, since a string answer needs something to pick from.
        /// </summary>
        public async Task<Response> DeleteOption(int optionId)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", "DELETE OPTION");
                        cmd.Parameters.AddWithValue("@OPTION_ID", optionId);

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: "Successfully deleted option",
                    body: optionId
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        /// <summary>
        /// Shared by CREATE and UPDATE - both flags take the exact same payload, only the
        /// flag and the presence of @MAIN_ID differ.
        /// </summary>
        private async Task<Response> SaveCategory(string flag, int? mainId, DocumentCategory category, long? createdBy, string successMessage)
        {
            if (category == null || string.IsNullOrWhiteSpace(category.Name))
            {
                return new Response(
                    success: false,
                    debugScript: CommandText,
                    message: "Category name is required",
                    body: null
                );
            }

            DataTable dtSubCategories = BuildSubCategoryTable(category);
            DataTable dtOptions = BuildOptionTable(category);

            try
            {
                int savedId = mainId ?? 0;

                using (SqlConnection con = new SqlConnection(_conString))
                {
                    await con.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand(CommandText, con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@FLAG", flag);
                        cmd.Parameters.AddWithValue("@MAIN_ID", (object)mainId ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@NAME", category.Name.Trim());
                        /*THE TABLE STORES THE NEGATION OF WHAT THE CLIENT SENDS*/
                        cmd.Parameters.AddWithValue("@IS_NO_SUBCATEGORY", !category.HasSubCategories);
                        cmd.Parameters.AddWithValue("@OPTION_TYPE", (object)category.Type ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@CREATED_BY", (object)createdBy ?? DBNull.Value);

                        cmd.Parameters.Add(new SqlParameter("@SUB_CATEGORY", SqlDbType.Structured)
                        {
                            TypeName = "[UDT].[DocSubCategory]",
                            Value = dtSubCategories
                        });

                        cmd.Parameters.Add(new SqlParameter("@OPTIONS", SqlDbType.Structured)
                        {
                            TypeName = "[UDT].[DocOption]",
                            Value = dtOptions
                        });

                        object result = await cmd.ExecuteScalarAsync();

                        if (result != null && result != DBNull.Value)
                            savedId = Convert.ToInt32(result);
                    }
                }

                category.Id = savedId;

                return new Response(
                    success: true,
                    debugScript: CommandText,
                    message: successMessage,
                    body: category
                );
            }
            catch (SqlException Ex)
            {
                return Failed(Ex.Message);
            }
            catch (Exception Ex)
            {
                return Failed(Ex.Message);
            }
        }

        /// <summary>
        /// ROW_KEY is the position of the sub-category in the payload. The proc uses it to
        /// attach options to sub-categories whose identity IDs do not exist yet.
        /// </summary>
        private static DataTable BuildSubCategoryTable(DocumentCategory category)
        {
            var dtSubCategories = new DataTable();
            dtSubCategories.Columns.Add("ROW_KEY", typeof(int));
            dtSubCategories.Columns.Add("NAME", typeof(string));
            dtSubCategories.Columns.Add("OPTION_TYPE", typeof(string));

            if (!category.HasSubCategories || category.SubCategories == null)
                return dtSubCategories;

            for (int i = 0; i < category.SubCategories.Count; i++)
            {
                DocumentSubCategory subCategory = category.SubCategories[i];

                if (subCategory == null || string.IsNullOrWhiteSpace(subCategory.Name))
                    continue;

                dtSubCategories.Rows.Add(new object[]
                {
                    i + 1,
                    subCategory.Name.Trim(),
                    subCategory.Type,
                });
            }

            return dtSubCategories;
        }

        /// <summary>
        /// A NULL ROW_KEY marks an option of the main category, otherwise it matches the
        /// ROW_KEY assigned in <see cref="BuildSubCategoryTable"/>.
        /// </summary>
        private static DataTable BuildOptionTable(DocumentCategory category)
        {
            var dtOptions = new DataTable();
            dtOptions.Columns.Add("ROW_KEY", typeof(int));
            dtOptions.Columns.Add("LABEL", typeof(string));

            if (!category.HasSubCategories)
            {
                if (category.Options != null)
                {
                    foreach (string option in category.Options)
                    {
                        if (string.IsNullOrWhiteSpace(option)) continue;

                        dtOptions.Rows.Add(new object[] { DBNull.Value, option.Trim() });
                    }
                }

                return dtOptions;
            }

            if (category.SubCategories == null)
                return dtOptions;

            for (int i = 0; i < category.SubCategories.Count; i++)
            {
                DocumentSubCategory subCategory = category.SubCategories[i];

                if (subCategory == null || subCategory.Options == null) continue;

                foreach (string option in subCategory.Options)
                {
                    if (string.IsNullOrWhiteSpace(option)) continue;

                    dtOptions.Rows.Add(new object[] { i + 1, option.Trim() });
                }
            }

            return dtOptions;
        }

        /// <summary>
        /// Reads the CURRENT result set into a DataTable and leaves the reader on it.
        /// DataTable.Load cannot be used when more result sets follow: it consumes one set
        /// and then advances the reader itself, so a caller that also calls NextResult
        /// skips a set and runs the reader off the end ("reader is closed").
        /// </summary>
        private static async Task<DataTable> ReadTableAsync(SqlDataReader reader)
        {
            var table = new DataTable();

            for (int i = 0; i < reader.FieldCount; i++)
            {
                table.Columns.Add(reader.GetName(i), reader.GetFieldType(i));
            }

            while (await reader.ReadAsync())
            {
                object[] values = new object[reader.FieldCount];
                reader.GetValues(values);

                table.Rows.Add(values);
            }

            return table;
        }

        private static Response Failed(string message)
        {
            return new Response(
                success: false,
                debugScript: CommandText,
                message: message,
                body: null
            );
        }
    }
}
