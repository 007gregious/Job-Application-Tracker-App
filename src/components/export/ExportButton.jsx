import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Button from '../common/Button';
import { FaFileExcel } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ExportButton = ({ data, filename = 'job-applications' }) => {
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = data.map(app => ({
        Company: app.company,
        Position: app.position,
        Location: app.location || 'N/A',
        'Job Type': app.jobType || 'N/A',
        Status: app.status,
        'Applied Date': new Date(app.appliedDate).toLocaleDateString(),
        Salary: app.salary || 'N/A',
        'Contact Person': app.contactPerson || 'N/A',
        'Contact Email': app.contactEmail || 'N/A',
        'Job URL': app.jobUrl || 'N/A',
        Notes: app.notes || 'N/A'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Save file
      saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Applications exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export applications');
    }
  };

  return (
    <Button 
      variant="success" 
      onClick={exportToExcel}
      icon={<FaFileExcel />}
      disabled={data.length === 0}
    >
      Export to Excel
    </Button>
  );
};

export default ExportButton;