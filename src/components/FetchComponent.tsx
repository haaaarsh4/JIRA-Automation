import React, { useState } from 'react';
import { Download, Filter, FileSpreadsheet } from 'lucide-react';

export default function FetchComponent() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    assignee: '',
    labels: '',
    fixVersion: '',
    issueType: '',
    priority: '',
    customJQL: ''
  });
  
  const [selectedFields, setSelectedFields] = useState([
    'key', 'summary', 'status', 'assignee', 'priority', 'created', 'updated'
  ]);

  const availableFields = [
    { value: 'summary', label: 'Summary' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'created', label: 'Created Date' },
    { value: 'updated', label: 'Updated Date' },
    { value: 'description', label: 'Description' },
    { value: 'labels', label: 'Labels' },
    { value: 'fixVersions', label: 'Fix Versions' },
    { value: 'T-shirt size', label: 'T-shirt size' },
    { value: 'groomingDeadline', label: 'Grooming Deadline' },
    { value: 'BAEffort', label: 'BA Effort' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldSelection = (field: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFields(prev => [...prev, field]);
    } else {
      setSelectedFields(prev => prev.filter(f => f !== field));
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          fields: selectedFields
        }),
      });

      if (response.ok) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `jira-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('Export completed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Export JIRA Issues</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={filters.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={filters.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={filters.labels}
                onChange={(e) => handleInputChange('labels', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fix Version
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                value={filters.fixVersion}
                onChange={(e) => handleInputChange('fixVersion', e.target.value)}
              />
            </div>
            <div className='flex items-center justify-center'>
                OR
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom JQL (Advanced)
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                rows={3}
                value={filters.customJQL}
                onChange={(e) => handleInputChange('customJQL', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, custom JQL overrides other filters
              </p>
            </div>
          </div>
        </div>

        {/* Fields Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Fields to Export</h3>
          <div className="grid gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
            {availableFields.map((field) => (
              <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.value)}
                  onChange={(e) => handleFieldSelection(field.value, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Selected: {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleExport}
          disabled={loading || selectedFields.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-5 w-5" />
          {loading ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>
    </div>
  );
}