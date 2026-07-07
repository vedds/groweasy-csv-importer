const { parse } = require('csv-parse/sync');

/**
 * Parses a CSV buffer into an array of row objects.
 * Handles BOM, multiple delimiters, quoted fields, and uneven columns.
 */
function parseCSV(buffer) {
  // Convert buffer to string and strip UTF-8 BOM if present
  let content = buffer.toString('utf-8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // Try common delimiters in order of popularity
  const delimiters = [',', ';', '\t', '|'];
  let lastError;

  for (const delimiter of delimiters) {
    try {
      const records = parse(content, {
        columns: true,            // First row = headers
        skip_empty_lines: true,
        trim: true,
        delimiter,
        relax_quotes: true,       // Allow imperfect quoting
        relax_column_count: true, // Allow rows with different column counts
        skip_records_with_error: true,
      });

      if (records.length > 0) {
        return records;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Failed to parse CSV: ${lastError?.message || 'Unknown error. Make sure the file is a valid CSV.'}`
  );
}

module.exports = { parseCSV };
