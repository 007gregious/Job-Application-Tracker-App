import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportService = {
  toExcel: (data, filename = 'applications') => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
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