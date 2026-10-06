"use client";

import React, { useState } from "react";
import { usePortal } from "../../portal/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function ReportsPanel() {
  const { currentRole, events } = usePortal();
  const { toast, showToast } = useToast();
  const [range, setRange] = useState("last-30");

  if (currentRole !== "admin" && currentRole !== "teacher") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
        <div className="p-8 bg-white border border-red-200 text-red-500 font-bold rounded-2xl">
          Access Denied: Teacher or Admin credentials required.
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    // Generate CSV raw content
    const headers = "Event ID,Title,Location,Date,Start Time,End Time,Timezone\n";
    const rows = events
      .map(
        (evt) =>
          `"${evt.id}","${evt.title}","${evt.location}","${evt.startDate}","${evt.startTime}","${evt.endTime}","${evt.timezone}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sriaawp_calendar_report_${range}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Event report generated successfully");
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        <div className="border-b border-secondary/10 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Administrative Reports Console</h2>
          <p className="text-xs text-gray-500 font-bold">Compile and export activities audit files</p>
        </div>

        <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm max-w-md space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Download Calendar Audit File</h3>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Compile event bookings and co-curricular logs inside the designated timeframe. File format: `.csv` spreadsheet.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Compilation Window</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="last-30">Last 30 Days</option>
              <option value="last-90">Last 90 Days</option>
              <option value="all-time">All-Time Cumulative</option>
            </select>
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-primary text-white hover:bg-primary/95 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer shadow border border-secondary transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
