"use client";

import FetchComponent from "@/components/FetchComponent";
import UpdateComponent from "@/components/UpdateComponent";
import Image from "next/image";
import React, { useState } from 'react';

export default function Home() {
  const [selected, setSelected] = useState<"update" | "fetch">("update");

  return (
      <div className="flex flex-col items-center text-center mt-3 px-10"> 
        <h1 className="text-4xl font-bold text-gray-900 mb-2">JIRA Automation</h1>
        <div className="flex flex-row">
          <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-700 font-medium text-sm">This tool is intended solely for authorized users. Unauthorized or inappropriate use may constitute a federal crime.</p>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-8 w-full mb-4">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              <button
                onClick={() => setSelected("update")}
                className={`flex-1 px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                  selected === "update"
                    ? "bg-blue-600 text-white border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Update Data
                </div>
              </button>
              <button
                onClick={() => setSelected("fetch")}
                className={`flex-1 px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                  selected === "fetch"
                    ? "bg-blue-600 text-white border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Fetch Data
                </div>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {selected === "update" && <UpdateComponent />}
            {selected === "fetch" && <FetchComponent />}
          </div>
        </div>
      </div>
  );
}