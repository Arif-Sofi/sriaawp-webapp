"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePortal, RoleType } from "../portal/context/PortalContext";

interface SidebarProps {
  activePanel: string;
  setActivePanel?: (panel: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: RoleType[];
}

export default function Sidebar({ activePanel, setActivePanel }: SidebarProps) {
  const { currentRole } = usePortal();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher", "parent", "student", "public"]
    },
    {
      id: "calendar",
      label: "School Takwim",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher", "parent", "student", "public"]
    },
    {
      id: "news",
      label: "School Memos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2-4h-10m10 4h-10m10 4h-6" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher", "parent", "student", "public"]
    },
    {
      id: "documents",
      label: "Departments Hub",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8m8 4H8m2-8H8" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher"]
    },
    {
      id: "cocurricular",
      label: "Cocurricular Record",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher", "student", "parent"]
    },
    {
      id: "users",
      label: "Manage Users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      allowedRoles: ["admin"]
    },
    {
      id: "reports",
      label: "Generate Reports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      allowedRoles: ["admin", "teacher"]
    }
  ];

  const visibleItems = menuItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-80px)] border-r border-slate-800 p-6 flex flex-col justify-between font-montserrat shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] text-slate-400 font-black tracking-wider uppercase mb-3 px-3">
            Main Subsystems
          </div>
          <nav className="space-y-1.5">
            {visibleItems.map((item) => {
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "dashboard") {
                      router.push("/portal");
                    } else {
                      router.push(`/${item.id}`);
                    }
                    if (setActivePanel) {
                      setActivePanel(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Active Role Indicator Card */}
      {/* <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4.5">
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
          Active Context
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-sm">
            {currentRole === "admin" && "🛡️"}
            {currentRole === "teacher" && "👩‍🏫"}
            {currentRole === "student" && "🎓"}
            {currentRole === "parent" && "👨‍👩"}
          </div>
          <div>
            <div className="text-[11px] font-black leading-tight text-white capitalize">
              {currentRole} Account
            </div>
            <div className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">
              {currentRole === "admin" && "HOD / School Head"}
              {currentRole === "teacher" && "Standard Staff"}
              {currentRole === "student" && "Enrolled Student"}
              {currentRole === "parent" && "Guardian Node"}
            </div>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
