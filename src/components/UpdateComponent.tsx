import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UpdateComponent = () => {
  const [selectedField, setSelectedField] = useState("");
  const [mode, setMode] = useState<"excel" | "manual">("excel");

  const jiraFields = [
    { value: "Grooming Deadline", label: "Grooming Deadline", field_id: "customfield_13602" },
    { value: "Grooming Start Date (Project)", label: "Grooming Start Date (Project)", field_id: "customfield_13602" },
    { value: "Grooming End Date (Project)", label: "Grooming End Date (Project)", field_id: "customfield_13602" },
    { value: "Target Version", label: "Target Version", field_id: "customfield_13602" },
    { value: "T-Shirt Size", label: "T-Shirt Size", field_id: "customfield_13602" },
    { value: "BA Effort", label: "BA Effort", field_id: "customfield_13602" },
    { value: "Dev Effort", label: "Dev Effort", field_id: "customfield_13602" },
    { value: "QA Effort", label: "QA Effort", field_id: "customfield_13602" },
  ];

  const handleProcess = async (event: React.FormEvent) => {
  event.preventDefault();
  const fileInput = document.querySelector<HTMLInputElement>("input[type=file]");
  if (!fileInput?.files?.length) return;

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jiraField", selectedField); // Pass the selected JIRA field

  const res = await fetch("/api/update-jira", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    alert("File processed successfully!");
  } else {
    const data = await res.json();
    alert("Error: " + data.message);
  }
};

  return (
    <div>
      {/* Field Selection */}
      <div className="flex flex-row items-center justify-center">
        <p className="mr-2">Select the JIRA field you would like to update:</p>
        <Select value={selectedField} onValueChange={setSelectedField} name="JIRA Field">
          <SelectTrigger className="w-80 h-10 bg-white border-2 border-gray-300 hover:border-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select JIRA Field" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
            <SelectGroup>
              <SelectLabel></SelectLabel>
              {jiraFields.map((field) => (
                <SelectItem
                  key={field.value}
                  value={field.value}
                  className="py-3 hover:bg-blue-50 focus:bg-blue-50"
                >
                  {field.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 mt-4">
        {/* Instructions */}
        <div className="">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Upload Excel File
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
            <strong>Column 1</strong> must contain the Feature # 
            (e.g., <code>SAMS-123</code>) and <strong>Column 2</strong> must contain the new value 
            you want to update.
            </p>
        </div>

        {/* Clean File Upload */}
        <div className="space-y-3">          
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              disabled={!selectedField}
              className="block w-full text-sm text-gray-600 border border-gray-300 rounded-xl p-3 
                         file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                         file:text-sm file:font-semibold file:bg-blue-600 file:text-white
                         hover:file:bg-blue-700 file:transition-colors file:duration-200
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:file:bg-gray-500 disabled:file:cursor-not-allowed"
            />
          </div>
          
          <p className="text-xs text-gray-500">
            Supports .xlsx, .xls, and .csv files (max 10MB)
          </p>
        </div>

        {/* Process Button */}
        <div className="text-center mt-6">
          <button
            disabled={!selectedField}
            onClick={handleProcess}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Process File & Update JIRA
            </div>
          </button>
          {!selectedField && (
            <p className="text-sm text-red-700 mt-2">Please select a JIRA field first</p>
          )}
        </div>
      </div>
      

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-6">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-sm text-amber-800 mt-1">
            This action will update the selected field across multiple JIRA items.
            Please review your selection carefully before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateComponent;