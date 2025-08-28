"use client";

import FetchComponent from "@/components/FetchComponent";
import LogoutButton from "@/components/logoutButton";
import UpdateComponent from "@/components/UpdateComponent";
import React, { useState } from 'react';
import { AlertTriangle, Upload, Download } from 'lucide-react';

export default function DashboardContent() {
  const [selected, setSelected] = useState<"update" | "fetch">("update");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              JIRA Automation
            </h1>
          </div>
          <div className="ml-8">
            <LogoutButton />
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-8 shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold text-sm leading-relaxed">
                Authorized Personnel Only
              </p>
              <p className="text-red-700 text-sm mt-1 leading-relaxed">
                This tool is restricted to authorized users. Unauthorized access or misuse may violate federal regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <nav className="flex">
              <button
                onClick={() => setSelected("update")}
                className={`flex-1 px-8 py-6 text-base font-semibold transition-all duration-300 relative ${
                  selected === "update"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Upload className="w-5 h-5" />
                  <span className="text-lg">Update Data</span>
                </div>
                {selected === "update" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                )}
              </button>
              
              <button
                onClick={() => setSelected("fetch")}
                className={`flex-1 px-8 py-6 text-base font-semibold transition-all duration-300 relative ${
                  selected === "fetch"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span className="text-lg">Fetch Data</span>
                </div>
                {selected === "fetch" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                )}
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-8 bg-gradient-to-b from-white to-gray-50/30 min-h-[500px]">
            <div className="transition-all duration-500 ease-in-out">
              {selected === "update" && <UpdateComponent />}
              {selected === "fetch" && <FetchComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
