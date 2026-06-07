import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const FORMULA_PREFIX_PATTERN = /^[=+\-@\t\r]/;

const escapeSpreadsheetValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return FORMULA_PREFIX_PATTERN.test(value) ? `'${value}` : value;
};

const sanitizeExportRow = (row) => Object.fromEntries(
  Object.entries(row).map(([key, value]) => [key, escapeSpreadsheetValue(value)])
);

export const exportService = {
  toExcel: (data, filename = 'applications') => {
    try {
      const ws = XLSX.utils.json_to_sheet(data.map(sanitizeExportRow));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
      return true;
    } catch (error) {
      console.error('Export error:', error);
      return false;
    }
  },

  prepareDataForExport: (applications) => {
    return applications.map(app => ({
      'Company': app.company,
      'Position': app.position,
      'Location': app.location || 'N/A',
      'Job Type': app.jobType || 'N/A',
      'Status': app.status,
      'Applied Date': new Date(app.appliedDate).toLocaleDateString(),
      'Salary': app.salary || 'N/A',
      'Contact': app.contactPerson || 'N/A',
      'Contact Email': app.contactEmail || 'N/A',
      'Job URL': app.jobUrl || 'N/A',
      'Notes': app.notes || 'N/A'
    }));
  }
};
