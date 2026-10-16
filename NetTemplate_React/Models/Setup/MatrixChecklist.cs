using Newtonsoft.Json;
using System.Data;

namespace NetTemplate_React.Models.Setup
{
    /// <summary>
    /// The four result sets of 'GET CHECKLIST' on [DOC].[NSP_ManageMatrixSchemeChecklist],
    /// kept apart rather than flattened: the matrix is columns x rows, so joining them
    /// server side would repeat every document once per column.
    ///
    /// The client keys a checkbox on <c>hdr_id</c> + <c>column_key</c> - a cell that is
    /// missing from <see cref="Cells"/> is simply unticked.
    /// </summary>
    public class MatrixChecklist
    {
        /// <summary>The financing scheme being shown - one tab of the workbook.</summary>
        [JsonProperty("scheme")]
        public DataTable Scheme { get; set; }

        /// <summary>
        /// The column headers, derived from the category setup. <c>axis_name</c> is the
        /// merged top header, <c>column_label</c> the one under it.
        /// </summary>
        [JsonProperty("columns")]
        public DataTable Columns { get; set; }

        /// <summary>One document per row, with the scheme specific attributes.</summary>
        [JsonProperty("rows")]
        public DataTable Rows { get; set; }

        /// <summary>The ticked cells of every row on this tab.</summary>
        [JsonProperty("cells")]
        public DataTable Cells { get; set; }
    }
}
