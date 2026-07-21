using System;
using System.Data;

namespace NetTemplate_React.Utils
{
    public static class DataRowUtils
    {
        /// <summary>
        /// Safely extracts and converts a value from a DataRow.
        /// </summary>
        /// <typeparam name="T">Type to convert to</typeparam>
        /// <param name="row">The DataRow containing the data</param>
        /// <param name="columnName">Column name to extract</param>
        /// <param name="defaultValue">Default value if column doesn't exist or is null</param>
        /// <returns>Converted value or default</returns>
        public static T GetValue<T>(DataRow row, string columnName, T defaultValue = default)
        {
            if (row == null)
                throw new ArgumentNullException(nameof(row));

            if (!row.Table.Columns.Contains(columnName))
                return defaultValue;

            var value = row[columnName];

            // Null or DBNull → return default
            if (value == null || value == DBNull.Value)
            {
                if (typeof(T) == typeof(double))
                    return (T)(object)0d;

                return defaultValue;
            }

            try
            {
                Type targetType = typeof(T);

                // ✅ Direct cast if already the correct type
                if (targetType.IsAssignableFrom(value.GetType()))
                    return (T)value;

                // ✅ Special handling for numeric conversions
                if (targetType == typeof(int))
                    return (T)(object)Convert.ToInt32(value);

                if (targetType == typeof(long))
                    return (T)(object)Convert.ToInt64(value);

                if (targetType == typeof(decimal))
                    return (T)(object)Convert.ToDecimal(value);

                if (targetType == typeof(double))
                    return (T)(object)Convert.ToDouble(value);

                // ✅ String
                if (targetType == typeof(string))
                    return (T)(object)value.ToString();

                // ✅ DateTime
                if (targetType == typeof(DateTime))
                    return (T)(object)Convert.ToDateTime(value);

                // ✅ Boolean
                if (targetType == typeof(bool))
                {
                    // Handle string values like "true"/"1"
                    if (value is string s)
                        return (T)(object)(s == "1" || s.Equals("true", StringComparison.OrdinalIgnoreCase));

                    return (T)(object)Convert.ToBoolean(value);
                }

                // ✅ Fallback conversion
                return (T)Convert.ChangeType(value, targetType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetValue] Error converting '{columnName}' ({value?.GetType().Name}) to {typeof(T).Name}: {ex.Message}");
                return defaultValue;
            }
        }

    }
}
