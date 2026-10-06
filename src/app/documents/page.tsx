"use client";

import React from "react";
import { PortalProvider } from "../portal/context/PortalContext";
import PortalHeader from "../components/PortalHeader";
import Sidebar from "../components/Sidebar";
import DocumentsPanel from "../components/panels/DocumentsPanel";
import AIAssistantDrawer from "../components/AIAssistantDrawer";

export default function DocumentsPage() {
  return (
    <PortalProvider>
      <div className="w-full min-h-screen bg-slate-50 flex flex-col font-montserrat">
        {/* Main Dashboard Header */}
        <PortalHeader />

        <div className="flex flex-1 flex-row">
          {/* Dashboard Sidebar Navigation */}
          <Sidebar activePanel="documents" />

          {/* Individual Page Content */}
          <DocumentsPanel />
        </div>

        {/* Global Agentic AI Chat Assistant Drawer */}
        <AIAssistantDrawer />
      </div>
    </PortalProvider>
  );
}
