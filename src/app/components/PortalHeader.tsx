"use client";

import React from "react";
import { usePortal, RoleType } from "../portal/context/PortalContext";
import Link from "next/link";
import schoolLogo from "@/images/logo.png";
import Image from "next/image";

export default function PortalHeader() {
  const { currentRole, setCurrentRole, resetAllState } = usePortal();

  const roles: { value: RoleType; label: string; icon: string; color: string }[] = [
    { value: "public", label: "Public (Guest)", icon: "", color: "from-slate-500 to-slate-600" },
    { value: "student", label: "Student View", icon: "", color: "from-blue-500 to-indigo-600" },
    { value: "parent", label: "Parent View", icon: "", color: "from-green-500 to-emerald-600" },
    { value: "teacher", label: "Teacher / Staff View", icon: "", color: "from-purple-500 to-violet-600" },
    { value: "admin", label: "Admin / HOD View", icon: "", color: "from-rose-500 to-red-600" }
  ];

  const activeRoleInfo = roles.find((r) => r.value === currentRole) || roles[0];

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="w-full h-20 bg-white border-b border-secondary/15 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-sm font-montserrat">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <Link href="/portal" className="flex items-center gap-2.5 group">
          <a href="/portal">
            <Image src={schoolLogo} alt="School Logo" className="w-15 h-15 "/>
          </a>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
              SRIAAWP PORTAL
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider leading-none">
              SCHOOL MANAGEMENT SYSTEM
            </p>
          </div>
        </Link>
      </div>

      {/* Center Ticker or Welcome Message */}
      {/* <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-secondary/10 px-4 py-1.5 rounded-full text-xs text-slate-600 font-semibold shadow-inner">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Takwim System Active</span>
        <span className="text-gray-300">|</span>
        <span className="text-primary font-bold">19 Use Cases Integrated</span>
      </div> */}

      {/* Role Switcher Selector Widget & Control Panel */}
      <div className="flex items-center gap-4">
        {/* Reset State Button */}
        <button
          onClick={() => {
            if (confirm("Reset portal to default mock database state? This will wipe localStorage edits.")) {
              resetAllState();
            }
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
          title="Reset Mock Database"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Dynamic Switcher Selector */}
        <div className="relative">
          <div onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-100 border border-secondary/15 rounded-xl px-3 py-2 cursor-pointer shadow-sm hover:bg-slate-200/50 hover:border-secondary/25 transition-all">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{activeRoleInfo.icon}</span>
              <span className="hidden md:inline">{activeRoleInfo.label}</span>
              <span className="md:hidden capitalize">{currentRole}</span>
            </span>
            <svg className="w-4 h-4 text-gray-500 transition-transform group-hover/switcher:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Hover Menu */}
          <div className={`absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-secondary/15 shadow-xl  transition-all duration-300 z-50 overflow-hidden divide-y divide-slate-100 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="px-4 py-2.5 bg-slate-50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Sandbox Switch Role
            </div>
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => {setCurrentRole(r.value); setIsOpen(false);}}
                className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                  currentRole === r.value
                    ? "text-primary bg-primary/5"
                    : "text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </span>
                {currentRole === r.value && (
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
