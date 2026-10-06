"use client";

import React, { useState } from "react";
import { usePortal, SchoolMemo } from "../../portal/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function MemosFeedPanel() {
  const {
    currentRole,
    memos,
    addMemo,
    updateMemo,
    deleteMemo
  } = usePortal();

  const { toast, showToast } = useToast();

  const activeMemos = memos.filter((m) => !m.isArchived);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<SchoolMemo | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleCreateMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (addMemo) {
      addMemo(title.trim(), content.trim());
      showToast("Memo created successfully");
      setTitle("");
      setContent("");
      setShowAddModal(false);
    }
  };

  const handleEditMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || !editingMemo) return;
    if (updateMemo) {
      updateMemo(editingMemo.id, editTitle.trim(), editContent.trim());
      showToast("Memo updated successfully");
      setEditingMemo(null);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        <div className="border-b border-secondary/10 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">School Memos Hub</h2>
            <p className="text-xs text-gray-500 font-bold">View all active school notices and bulletins </p>
          </div>
          {(currentRole === "admin" || currentRole === "teacher") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Memo
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm">
          {activeMemos.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs">No active memos currently in feed.</div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100">
              {activeMemos.map((memo, idx) => (
                <div key={memo.id} className={`pt-6 flex justify-between items-start gap-4 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{memo.title}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">{memo.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{memo.content}</p>
                  </div>

                  {(currentRole === "admin" || currentRole === "teacher") && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMemo(memo);
                          setEditTitle(memo.title);
                          setEditContent(memo.content);
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border border-transparent"
                        title="Edit memo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          deleteMemo(memo.id);
                          showToast("Memo archived successfully");
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                        title="Archive notice"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CREATE MEMO MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Create Memo Announcement</h3>
              <form onSubmit={handleCreateMemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. School Holiday Announcement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Content</label>
                  <textarea
                    required
                    placeholder="Type the notice content details here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-white hover:bg-slate-50 border border-secondary/15 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                  >
                    Publish Memo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MEMO MODAL */}
        {editingMemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">Edit Memo Announcement</h3>
              <form onSubmit={handleEditMemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. School Holiday Announcement"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Content</label>
                  <textarea
                    required
                    placeholder="Type the notice content details here..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMemo(null)}
                    className="bg-white hover:bg-slate-50 border border-secondary/15 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
