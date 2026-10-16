using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;

namespace NetTemplate_React.Models.Setup
{
    /// <summary>
    /// One row of one financing scheme's checklist - a document as it applies to that
    /// scheme, plus every checkbox of that row. The cells are posted whole rather than
    /// one at a time, so 'SAVE CHECKLIST ROW' can rebuild them in a single transaction.
    /// </summary>
    public class MatrixChecklistRow
    {
        /// <summary>
        /// 0 on create. The proc reads it back with the identity it assigned.
        /// </summary>
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("file_id")]
        public int FileId { get; set; }

        /// <summary>The workbook's 'No.' column, within this scheme.</summary>
        [JsonProperty("seq_no")]
        public int? SeqNo { get; set; }

        /// <summary>The workbook's 'Applicable To / Condition' column.</summary>
        [JsonProperty("condition_text")]
        public string ConditionText { get; set; }

        [JsonProperty("scanned_copy_id")]
        public int? ScannedCopyId { get; set; }

        [JsonProperty("due_date_id")]
        public int? DueDateId { get; set; }

        [JsonProperty("milestone_id")]
        public int? MilestoneId { get; set; }

        [JsonProperty("expiry_id")]
        public int? ExpiryId { get; set; }

        [JsonProperty("source_id")]
        public int? SourceId { get; set; }

        /// <summary>Null while nobody has decided - the workbook ships this column as a draft.</summary>
        [JsonProperty("is_required_for_commission")]
        public bool? IsRequiredForCommission { get; set; }

        [JsonProperty("remarks")]
        public string Remarks { get; set; }

        [JsonProperty("cells")]
        public List<MatrixCell> Cells { get; set; }

        /// <summary>
        /// The cells as [UDT].[DocMatrixCell] expects them. The column ORDER is what the
        /// type binds on, not the names, so it has to match the type declaration.
        /// </summary>
        public DataTable ToCellTable()
        {
            var table = new DataTable();

            table.Columns.Add("MAIN_ID", typeof(int));
            table.Columns.Add("SUB_ID", typeof(int));
            table.Columns.Add("OPTION_ID", typeof(int));
            table.Columns.Add("IS_APPLICABLE", typeof(bool));

            if (Cells == null) return table;

            foreach (var cell in Cells)
            {
                if (cell == null || cell.MainId <= 0) continue;

                table.Rows.Add(
                    cell.MainId,
                    cell.SubId.HasValue ? (object)cell.SubId.Value : DBNull.Value,
                    cell.OptionId.HasValue ? (object)cell.OptionId.Value : DBNull.Value,
                    cell.IsApplicable
                );
            }

            return table;
        }
    }

    /// <summary>
    /// One checkbox. The three ids address a column of [DOC].[vw_MatrixColumn] - the proc
    /// drops any cell that does not, which is what retires a deactivated category.
    /// </summary>
    public class MatrixCell
    {
        [JsonProperty("main_id")]
        public int MainId { get; set; }

        [JsonProperty("sub_id")]
        public int? SubId { get; set; }

        [JsonProperty("option_id")]
        public int? OptionId { get; set; }

        [JsonProperty("is_applicable")]
        public bool IsApplicable { get; set; }
    }
}
