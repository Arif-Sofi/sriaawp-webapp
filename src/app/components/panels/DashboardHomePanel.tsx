"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortal, RoleType, UserProfile } from "../../portal/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function DashboardHomePanel() {
  const {
    currentRole,
    setCurrentRole,
    memos,
    deleteMemo,
    events,
    achievements,
    users,
    studentGroups,
    registerUser,
    verifyUser
  } = usePortal();

  const router = useRouter();
  const { toast, showToast } = useToast();

  const activeMemos = memos.filter((m) => !m.isArchived);
  const pendingReviews = achievements.filter((a) => a.status === "pending").length;

  // Guest view forms state
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<RoleType>("student");
  const [regPassword, setRegPassword] = useState("");
  const [pendingVerificationUser, setPendingVerificationUser] = useState<UserProfile | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast("Please enter an email", "error");
      return;
    }
    
    // Find matching mock user
    const matched = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (matched) {
      if (matched.isVerified === false) {
        showToast("Account requires verification. Check verification email link.", "error");
        setPendingVerificationUser(matched);
        return;
      }
      setCurrentRole(matched.role);
      showToast(`Logged in successfully as ${matched.name} (${matched.role})`);
    } else {
      // Allow demo shortcut strings
      if (loginEmail === "student") {
        setCurrentRole("student");
        showToast("Logged in as student.");
      } else if (loginEmail === "teacher") {
        setCurrentRole("teacher");
        showToast("Logged in as teacher.");
      } else if (loginEmail === "admin") {
        setCurrentRole("admin");
        showToast("Logged in as admin.");
      } else if (loginEmail === "parent") {
        setCurrentRole("parent");
        showToast("Logged in as parent.");
      } else {
        showToast("Invalid credentials. Try guest demo accounts.", "error");
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast("Please fill in required fields", "error");
      return;
    }

    const newUser = registerUser(regName, regEmail, regPhone, regRole);
    setPendingVerificationUser(newUser);
    showToast("Registration pending! Check verification link.");
  };

  const handleVerify = () => {
    if (!pendingVerificationUser) return;
    verifyUser(pendingVerificationUser.id);
    setCurrentRole(pendingVerificationUser.role);
    showToast(`Verification successful! Logged in as ${pendingVerificationUser.name}`);
    setPendingVerificationUser(null);
    setRegName("");
    setRegEmail("");
    setRegPhone("");
  };

  // Find linked student for Parent
  const linkedStudentId = "student-uuid-111"; // Ahmad's child Ali
  const childProfile = users.find(u => u.id === linkedStudentId) || { id: linkedStudentId, name: "Ali bin Abu" };
  const childGroups = studentGroups[linkedStudentId] || ["Scouts", "Chess Club"];
  const childAchievements = achievements.filter(a => a.studentId === linkedStudentId);

  const upcomingEvents = [...events]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      {/* 1. PUBLIC GUEST VIEW */}
      {currentRole === "public" && (
        <div className="space-y-6">
          {/* Welcome Guest Banner */}
          <div className="p-8 rounded-3xl bg-linear-to-r from-slate-700 to-slate-900 text-white shadow-xl relative overflow-hidden flex justify-between">
            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-black">Welcome to SRIAAWP</h2>
              <p className="text-white/80 text-sm max-w-xl">
                This portal is the official information hub for parents, teachers, and students of SRIAAWP. Log in to access your personalized dashboard.
              </p>
            </div>
            <a href="/login" className="text-white/80 text-sm max-w-xl flex items-center mr-20 ml-10">Sign-in →</a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: School Bulletin */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-sm text-slate-900">Latest Memos & Announcements</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">Active school notices</p>
                </div>
                <a href="/news" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                  See all
                </a>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 flex-1">
                {activeMemos.slice(0, 2).map((memo, idx) => (
                  <div key={memo.id} className={`pt-4 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-800">{memo.title}</h4>
                      <span className="text-[9px] text-gray-400 font-semibold">{memo.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{memo.content}</p>
                  </div>
                ))}
                {activeMemos.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-xs">No active notices.</div>
                )}
              </div>
              {activeMemos.length > 2 && (
                <button
                  onClick={() => router.push("/news")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2 border-t border-slate-100 cursor-pointer"
                >
                  View All Memos →
                </button>
              )}
            </div>

            {/* Middle Column: Upcoming Events */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-sm text-slate-900">Upcoming Events</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">School calendar schedule</p>
                </div>
                <a href="/calendar" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                  See all
                </a>
              </div>

              <div className="space-y-3 flex-1">
                {upcomingEvents.map((evt) => {
                  const getEventDay = (dateStr: string) => dateStr.split("-")[2] || "01";
                  return (
                    <div key={evt.id} className="flex items-center gap-3 p-2.5 border border-secondary/10 rounded-2xl hover:bg-slate-50/50 transition-colors">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[8px] text-primary font-black uppercase tracking-wider leading-none">Jul</span>
                        <span className="text-sm font-black text-slate-800 leading-tight mt-0.5">{getEventDay(evt.startDate)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-slate-800">{evt.title}</h4>
                        <p className="text-[9px] text-gray-400 font-semibold">{evt.startTime} - {evt.endTime} • {evt.location}</p>
                      </div>
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-xs">No upcoming events.</div>
                )}
              </div>
              {events.length > 3 && (
                <button
                  onClick={() => router.push("/calendar")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors py-2 border-t border-slate-100 cursor-pointer"
                >
                  View Calendar →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PARENT GUARDIAN VIEW */}
      {currentRole === "parent" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Memos Card */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-sm text-slate-900">Important Bulletins & News</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">Active school notices</p>
                </div>
                <a href="/news" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                  See all
                </a>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 flex-1">
                {activeMemos.slice(0, 2).map((memo, idx) => (
                  <div key={memo.id} className={`pt-4 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-800">{memo.title}</h4>
                      <span className="text-[9px] text-gray-400 font-semibold">{memo.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{memo.content}</p>
                  </div>
                ))}
              </div>
              {activeMemos.length > 2 && (
                <button
                  onClick={() => router.push("/news")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-4 border-t border-slate-100 cursor-pointer"
                >
                  View All Memos →
                </button>
              )}
            </div>

            {/* Upcoming Events Card */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-sm text-slate-900">Upcoming Events</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">School calendar schedule</p>
                </div>
                <a href="/calendar" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                  See all
                </a>
              </div>

              <div className="space-y-3 flex-1">
                {upcomingEvents.map((evt) => {
                  const getEventDay = (dateStr: string) => dateStr.split("-")[2] || "01";
                  return (
                    <div key={evt.id} className="flex items-center gap-3 p-3 border border-secondary/10 rounded-2xl hover:bg-slate-50/50 transition-colors">
                      <div className="w-11 h-11 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] text-primary font-black uppercase tracking-wider leading-none">Jul</span>
                        <span className="text-base font-black text-slate-800 leading-tight mt-0.5">{getEventDay(evt.startDate)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-slate-800">{evt.title}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold">{evt.startTime} - {evt.endTime} • {evt.location}</p>
                      </div>
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-xs">No upcoming events.</div>
                )}
              </div>
              {events.length > 3 && (
                <button
                  onClick={() => router.push("/calendar")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-4 border-t border-slate-100 cursor-pointer"
                >
                  View Calendar →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD USER VIEW (Admin, Teacher, Student) */}
      {currentRole !== "public" && currentRole !== "parent" && (
        <div className="space-y-6">
          {/* Overview Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-secondary/10 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Takwim Events</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{events.length}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Conflict-Free</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-secondary/10 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Co-curricular Submissions</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{achievements.length}</span>
                <span className="text-[10px] text-slate-500 font-bold">Total Certificates</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-secondary/10 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending Approvals</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{pendingReviews}</span>
                {pendingReviews > 0 ? (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Action Required</span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold">Clear queue</span>
                )}
              </div>
            </div>
          </div>

          {/* Memos & Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Bulletin Card */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Latest Memos & News</h3>
                    <p className="text-[11px] text-gray-500 font-bold">Chronological bulletin feed</p>
                  </div>
                  <a href="/news" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                    See all
                  </a>
                </div>

                {activeMemos.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">No active memos listed.</div>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-100">
                    {activeMemos.slice(0, 2).map((memo, idx) => (
                      <div key={memo.id} className={`pt-4 flex justify-between items-start gap-4 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-800">{memo.title}</h4>
                            <span className="text-[10px] text-gray-400 font-semibold">{memo.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{memo.content}</p>
                        </div>

                        {/* Archive Memo button visible only for admin/teacher */}
                        {(currentRole === "admin" || currentRole === "teacher") && (
                          <button
                            onClick={() => {
                              deleteMemo(memo.id);
                              showToast("Memo archived successfully");
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Archive/Delete Notice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {activeMemos.length > 2 && (
                <button
                  onClick={() => router.push("/news")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-4 border-t border-slate-100 cursor-pointer animate-fadeIn mt-4"
                >
                  View All Memos →
                </button>
              )}
            </div>

            {/* Upcoming Events Card */}
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Upcoming Events</h3>
                    <p className="text-[11px] text-gray-500 font-bold">School calendar schedule</p>
                  </div>
                  <a href="/calendar" className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold px-2 py-0.5 rounded-full">
                    See all
                  </a>
                </div>

                <div className="space-y-3">
                  {upcomingEvents.map((evt) => {
                    const getEventDay = (dateStr: string) => dateStr.split("-")[2] || "01";
                    return (
                      <div key={evt.id} className="flex items-center gap-3 p-3 border border-secondary/10 rounded-2xl hover:bg-slate-50/50 transition-colors">
                        <div className="w-11 h-11 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] text-primary font-black uppercase tracking-wider leading-none">Jul</span>
                          <span className="text-base font-black text-slate-800 leading-tight mt-0.5">{getEventDay(evt.startDate)}</span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-800">{evt.title}</h4>
                          <p className="text-[10px] text-gray-500 font-semibold">{evt.startTime} - {evt.endTime} • {evt.location}</p>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-xs">No upcoming events scheduled.</div>
                  )}
                </div>
              </div>

              {events.length > 3 && (
                <button
                  onClick={() => router.push("/calendar")}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-4 border-t border-slate-100 cursor-pointer mt-4"
                >
                  View Calendar →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
