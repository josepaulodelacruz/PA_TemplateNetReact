using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using NetTemplate_React.Utils;

namespace NetTemplate_React.Models.Setup
{
    public class DocumentCategory
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// Inverse of [DOC].[MainCategory].[IS_NO_SUBCATEGORY]. The client thinks in
        /// "this category has sub-categories", the table stores the negation.
        /// </summary>
        [JsonProperty("has_sub_categories")]
        public bool HasSubCategories { get; set; }

        /// <summary>
        /// Only meaningful when <see cref="HasSubCategories"/> is false. "boolean" or "string".
        /// </summary>
        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("options")]
        public List<string> Options { get; set; } = new List<string>();

        [JsonProperty("sub_categories")]
        public List<DocumentSubCategory> SubCategories { get; set; } = new List<DocumentSubCategory>();

        [JsonProperty("sub_category_count")]
        public int SubCategoryCount { get; set; }

        /// <summary>
        /// Active options of the category itself. Always 0 when <see cref="HasSubCategories"/>
        /// is true - those options hang off the sub-categories instead.
        /// </summary>
        [JsonProperty("option_count")]
        public int OptionCount { get; set; }

        [JsonProperty("created_date")]
        public DateTime CreatedDate { get; set; }

        [JsonProperty("created_by")]
        public long? CreatedBy { get; set; }

        /// <summary>
        /// USERNAME resolved by the proc, so the client does not have to look it up.
        /// </summary>
        [JsonProperty("created_by_name")]
        public string CreatedByName { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("total_count")]
        public int TotalCount { get; set; }

        [JsonProperty("current_page")]
        public int CurrentPage { get; set; }

        [JsonProperty("page_size")]
        public int PageSize { get; set; }

        [JsonProperty("total_pages")]
        public int TotalPages { get; set; }

        [JsonProperty("has_next_page")]
        public bool HasNextPage { get; set; }

        [JsonProperty("has_previous_page")]
        public bool HasPreviousPage { get; set; }

        /// <summary>
        /// Transforms the paginated result set of 'GET CATEGORIES' into a list of categories.
        /// </summary>
        public static List<DocumentCategory> TransformCategories(DataTable dataTable)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<DocumentCategory>();

            var categories = new List<DocumentCategory>();

            foreach (DataRow row in dataTable.Rows)
            {
                categories.Add(new DocumentCategory
                {
                    Id = DataRowUtils.GetValue<int>(row, "ID"),
                    Name = DataRowUtils.GetValue<string>(row, "NAME"),
                    HasSubCategories = !DataRowUtils.GetValue<bool>(row, "IS_NO_SUBCATEGORY"),
                    Type = DataRowUtils.GetValue<string>(row, "OPTION_TYPE"),
                    CreatedDate = DataRowUtils.GetValue<DateTime>(row, "CREATED_DATE"),
                    CreatedBy = ReadCreatedBy(row),
                    CreatedByName = DataRowUtils.GetValue<string>(row, "CREATED_BY_NAME"),
                    IsActive = DataRowUtils.GetValue<bool>(row, "IS_ACTIVE"),
                    SubCategoryCount = DataRowUtils.GetValue<int>(row, "SUB_CATEGORY_COUNT"),
                    OptionCount = DataRowUtils.GetValue<int>(row, "OPTION_COUNT"),
                    TotalCount = DataRowUtils.GetValue<int>(row, "TotalCount"),
                    CurrentPage = DataRowUtils.GetValue<int>(row, "CurrentPage"),
                    PageSize = DataRowUtils.GetValue<int>(row, "PageSize"),
                    TotalPages = DataRowUtils.GetValue<int>(row, "TotalPages"),
                    HasNextPage = DataRowUtils.GetValue<int>(row, "HasNextPage") == 1,
                    HasPreviousPage = DataRowUtils.GetValue<int>(row, "HasPreviousPage") == 1,
                });
            }

            return categories;
        }

        /// <summary>
        /// Stitches the three result sets of 'GET CATEGORY BY ID' (main, sub-categories, options)
        /// back into a single category the client can bind to the form.
        /// </summary>
        public static DocumentCategory TransformCategory(DataTable main, DataTable subs, DataTable options)
        {
            if (main == null || main.Rows.Count == 0)
                return null;

            DataRow mainRow = main.Rows[0];

            var category = new DocumentCategory
            {
                Id = DataRowUtils.GetValue<int>(mainRow, "ID"),
                Name = DataRowUtils.GetValue<string>(mainRow, "NAME"),
                HasSubCategories = !DataRowUtils.GetValue<bool>(mainRow, "IS_NO_SUBCATEGORY"),
                Type = DataRowUtils.GetValue<string>(mainRow, "OPTION_TYPE"),
                CreatedDate = DataRowUtils.GetValue<DateTime>(mainRow, "CREATED_DATE"),
                CreatedBy = ReadCreatedBy(mainRow),
                CreatedByName = DataRowUtils.GetValue<string>(mainRow, "CREATED_BY_NAME"),
                IsActive = DataRowUtils.GetValue<bool>(mainRow, "IS_ACTIVE"),
            };

            if (options != null)
            {
                category.Options = options.Rows
                    .Cast<DataRow>()
                    .Where(row => DataRowUtils.GetValue<int>(row, "MAIN_CATEGORY_ID") == category.Id)
                    .Select(row => DataRowUtils.GetValue<string>(row, "LABEL"))
                    .ToList();
            }

            if (subs != null)
            {
                foreach (DataRow row in subs.Rows)
                {
                    var subCategory = new DocumentSubCategory
                    {
                        Id = DataRowUtils.GetValue<int>(row, "ID"),
                        MainId = DataRowUtils.GetValue<int>(row, "MAIN_ID"),
                        Name = DataRowUtils.GetValue<string>(row, "NAME"),
                        Type = DataRowUtils.GetValue<string>(row, "OPTION_TYPE"),
                        CreatedDate = DataRowUtils.GetValue<DateTime>(row, "CREATED_DATE"),
                        CreatedBy = ReadCreatedBy(row),
                        CreatedByName = DataRowUtils.GetValue<string>(row, "CREATED_BY_NAME"),
                        IsActive = DataRowUtils.GetValue<bool>(row, "IS_ACTIVE"),
                    };

                    if (options != null)
                    {
                        subCategory.Options = options.Rows
                            .Cast<DataRow>()
                            .Where(opt => DataRowUtils.GetValue<int>(opt, "SUB_CATEGORY_ID") == subCategory.Id)
                            .Select(opt => DataRowUtils.GetValue<string>(opt, "LABEL"))
                            .ToList();
                    }

                    category.SubCategories.Add(subCategory);
                }
            }

            category.SubCategoryCount = category.SubCategories.Count;
            category.OptionCount = category.Options.Count;

            return category;
        }

        /// <summary>
        /// CREATED_BY is a nullable BIGINT. GetValue collapses NULL to 0, which is never a
        /// valid USERS.ID since it is an IDENTITY(1,1), so 0 is read back as "no creator".
        /// </summary>
        internal static long? ReadCreatedBy(DataRow row)
        {
            long createdBy = DataRowUtils.GetValue<long>(row, "CREATED_BY");

            return createdBy == 0 ? (long?)null : createdBy;
        }
    }

    public class DocumentSubCategory
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("main_id")]
        public int MainId { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// "boolean" or "string".
        /// </summary>
        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("options")]
        public List<string> Options { get; set; } = new List<string>();

        [JsonProperty("created_date")]
        public DateTime CreatedDate { get; set; }

        [JsonProperty("created_by")]
        public long? CreatedBy { get; set; }

        [JsonProperty("created_by_name")]
        public string CreatedByName { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        /// <summary>
        /// The options table is the second result set of 'GET SUB CATEGORIES'. Pass null
        /// when the caller only needs the sub-categories themselves.
        /// </summary>
        public static List<DocumentSubCategory> TransformSubCategories(DataTable dataTable, DataTable options = null)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<DocumentSubCategory>();

            var subCategories = new List<DocumentSubCategory>();

            foreach (DataRow row in dataTable.Rows)
            {
                var subCategory = new DocumentSubCategory
                {
                    Id = DataRowUtils.GetValue<int>(row, "ID"),
                    MainId = DataRowUtils.GetValue<int>(row, "MAIN_ID"),
                    Name = DataRowUtils.GetValue<string>(row, "NAME"),
                    Type = DataRowUtils.GetValue<string>(row, "OPTION_TYPE"),
                    CreatedDate = DataRowUtils.GetValue<DateTime>(row, "CREATED_DATE"),
                    CreatedBy = DocumentCategory.ReadCreatedBy(row),
                    CreatedByName = DataRowUtils.GetValue<string>(row, "CREATED_BY_NAME"),
                    IsActive = DataRowUtils.GetValue<bool>(row, "IS_ACTIVE"),
                };

                if (options != null)
                {
                    subCategory.Options = options.Rows
                        .Cast<DataRow>()
                        .Where(opt => DataRowUtils.GetValue<int>(opt, "SUB_CATEGORY_ID") == subCategory.Id)
                        .Select(opt => DataRowUtils.GetValue<string>(opt, "LABEL"))
                        .ToList();
                }

                subCategories.Add(subCategory);
            }

            return subCategories;
        }
    }

    public class DocumentOption
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("label")]
        public string Label { get; set; }

        [JsonProperty("main_category_id")]
        public int? MainCategoryId { get; set; }

        [JsonProperty("sub_category_id")]
        public int? SubCategoryId { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        public static List<DocumentOption> TransformOptions(DataTable dataTable)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<DocumentOption>();

            var options = new List<DocumentOption>();

            foreach (DataRow row in dataTable.Rows)
            {
                int mainCategoryId = DataRowUtils.GetValue<int>(row, "MAIN_CATEGORY_ID");
                int subCategoryId = DataRowUtils.GetValue<int>(row, "SUB_CATEGORY_ID");

                options.Add(new DocumentOption
                {
                    Id = DataRowUtils.GetValue<int>(row, "ID"),
                    Label = DataRowUtils.GetValue<string>(row, "LABEL"),
                    MainCategoryId = mainCategoryId == 0 ? (int?)null : mainCategoryId,
                    SubCategoryId = subCategoryId == 0 ? (int?)null : subCategoryId,
                    IsActive = DataRowUtils.GetValue<bool>(row, "IS_ACTIVE"),
                });
            }

            return options;
        }
    }
}
