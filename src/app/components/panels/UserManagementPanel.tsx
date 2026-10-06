"use client";

import React, { useState } from "react";
import { usePortal, RoleType } from "../../portal/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function UserManagementPanel() {
  const {
    currentRole,
    users,
    updateUserRole,
    deleteUser
  } = usePortal();

  const { toast, showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  if (currentRole !== "admin") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
        <div className="p-8 bg-white border border-red-200 text-red-500 font-bold rounded-2xl">
          Access Denied: Admin credentials required.
        </div>
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        <div className="border-b border-secondary/10 pb-4">
          <h2 className="text-2xl font-black text-slate-800">User & RBAC Console</h2>
          <p className="text-xs text-gray-500 font-bold">Admin control panel for modifying school profile roles</p>
        </div>

        <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm space-y-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search profiles or roles..."
            className="w-full max-w-sm bg-slate-50 border border-secondary/20 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="border border-secondary/10 rounded-2xl overflow-hidden shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-black uppercase text-[10px] border-b border-secondary/10">
                  <th className="p-4">Name / ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Access Role</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{user.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">{user.id}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{user.email}</td>
                    <td className="p-4 text-slate-500 font-medium">{user.phone}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          updateUserRole(user.id, e.target.value as RoleType);
                          showToast("User role updated successfully.");
                        }}
                        className="bg-slate-50 border border-secondary/15 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                      >
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                            deleteUser(user.id);
                            showToast("User deleted successfully.");
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
