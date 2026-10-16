using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using NetTemplate_React.Utils;

namespace NetTemplate_React.Models.Setup
{
    /// <summary>
    /// One row of [DOC].[FilesDocumentHDR] - a document a buyer has to submit, filed
    /// under one of the document types of [DOC].[Labels].
    /// </summary>
    public class DocumentFile
    {
        /// <summary>
        /// 0 on create. The proc reads it back with the identity it assigned.
        /// </summary>
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("label_id")]
        public int LabelId { get; set; }

        /// <summary>
        /// The document type resolved by the proc. Write requests leave it null - the
        /// LABEL_ID is what gets stored.
        /// </summary>
        [JsonProperty("label")]
        public string Label { get; set; }

        /// <summary>
        /// Transforms the result set of 'GET DOCUMENT FILES'. The rows arrive flat,
        /// the client groups them into the document type tabs.
        /// </summary>
        public static List<DocumentFile> TransformDocuments(DataTable dataTable)
        {
            if (dataTable == null || dataTable.Rows.Count == 0)
                return new List<DocumentFile>();

            var documents = new List<DocumentFile>();

            foreach (DataRow row in dataTable.Rows)
            {
                documents.Add(new DocumentFile
                {
                    Id = DataRowUtils.GetValue<int>(row, "ID"),
                    Title = DataRowUtils.GetValue<string>(row, "TITLE"),
                    LabelId = DataRowUtils.GetValue<int>(row, "LABEL_ID"),
                    Label = DataRowUtils.GetValue<string>(row, "LABEL"),
                });
            }

            return documents;
        }
    }
}
