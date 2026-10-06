"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-background px-6 font-montserrat">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
        
        {/* Project Branding Text */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center border border-secondary shadow-lg">
            <span className="text-white text-3xl font-black">SR</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              SRIAAWP Portal System
            </h1>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
              School Management and Communication System with Agentic Tool Calling. Designed for Sekolah Rendah Islam Al Amin Wilayah Persekutuan.
            </p>
          </div>
        </div>

        {/* Access Links Card Grid */}
        <div className="flex flex-col justify-center gap-4">
          {/* Enter SRIAAWP Portal */}
          <Link href="/portal" className="group">
            <div className="p-6 bg-white/90 backdrop-blur border border-secondary/15 rounded-3xl shadow-md hover:shadow-xl hover:border-primary group-hover:scale-[1.02] transition-all duration-300 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl shadow group-hover:bg-primary/95">
                🏫
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">
                    Enter School Portal
                  </h3>
                  <span className="text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                  Interactive dashboards for Admin/HOD, Teachers, Parents, and Students. Features clash-checking Takwim calendars, document AI indexing, and co-curricular submissions.
                </p>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}