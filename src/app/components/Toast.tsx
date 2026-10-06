"use client";

import React, { useState } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return { toast, showToast };
}

export default function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-bounce transition-all ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
          : "bg-red-50 border-red-250 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      <span className="text-xs font-bold">{toast.message}</span>
    </div>
  );
}
