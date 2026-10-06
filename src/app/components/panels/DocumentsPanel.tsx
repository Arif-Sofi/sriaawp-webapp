"use client";

import React, { useState } from "react";
import { usePortal, SchoolDocument } from "../../portal/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function DocumentsPanel() {
  const {
    currentRole,
    departments,
    documents,
    uploadDocument,
    updateDocumentMetadata,
    deleteDocument,
    addDepartment,
    deleteDepartment
  } = usePortal();

  const { toast, showToast } = useToast();

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SchoolDocument | null>(null);

  // Add folder states
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  // Upload state
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Metadata Edit state
  const [newTitle, setNewTitle] = useState("");

  // Filter documents in active folder
  const activeDocs = documents.filter((doc) => doc.department === activeFolder);

  const triggerUpload = async (file: File) => {
    setUploadError("");
    if (!fileTitle.trim()) {
      setUploadError("Please provide a document title metadata");
      return;
    }

    // Extension Validation Check
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "doc" && ext !== "docx") {
      setUploadError("File format not supported. Only PDF and Word documents are accepted.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress bars
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 25;
      });
    }, 250);

    try {
      const fileUrl = URL.createObjectURL(file);
      await uploadDocument(activeFolder || "Student Affairs", fileTitle, file.name, file.size, fileUrl);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFileTitle("");
        setSelectedUploadFile(null);
        setShowUploadModal(false);
        showToast("Document uploaded successfully");
      }, 500);
    } catch {
      setIsUploading(false);
      setUploadError("Upload failed");
    }
  };

  const handleEditMetaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedDoc) return;
    updateDocumentMetadata(selectedDoc.id, newTitle);
    showToast("Metadata updated successfully");
    setShowEditModal(false);
  };

  const handleAddFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast("Folder name is required", "error");
      return;
    }
    if (addDepartment) {
      addDepartment(newFolderName.trim(), newFolderDesc.trim());
      showToast("Department folder created successfully");
      setNewFolderName("");
      setNewFolderDesc("");
      setShowAddFolderModal(false);
    }
  };

  if (currentRole !== "admin" && currentRole !== "teacher") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
        <div className="p-8 bg-white border border-red-200 text-red-500 font-bold rounded-2xl">
          Access Denied: Administrative credentials required.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-secondary/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Department Storage Hub</h2>
            <p className="text-xs text-gray-500 font-bold">
              {activeFolder ? `Viewing: Storage / ${activeFolder}` : "Root Storage Folders"}
            </p>
          </div>

          {!activeFolder && currentRole === "admin" && (
            <button
              onClick={() => setShowAddFolderModal(true)}
              className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Department Folder
            </button>
          )}

          {activeFolder && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFolder(null)}
                className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
              >
                Back to folders
              </button>
              <button
                onClick={() => {
                  setUploadError("");
                  setShowUploadModal(true);
                }}
                className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Document
              </button>
            </div>
          )}
        </div>

        {/* FOLDER EXPLORER VIEW (Root) */}
        {!activeFolder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              return (
                <div
                  key={dept.id}
                  onClick={() => setActiveFolder(dept.name)}
                  className="bg-white rounded-3xl border border-secondary/15 p-6 hover:border-primary hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200/50 group-hover:scale-105 transition-transform">
                      <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{dept.name}</h3>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{dept.description}</p>
                    </div>
                  </div>

                  {currentRole === "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the folder
                        if (confirm(`Are you sure you want to delete the folder "${dept.name}"? This will delete all documents inside this department.`)) {
                          if (deleteDepartment) {
                            deleteDepartment(dept.id);
                            showToast("Department folder deleted successfully");
                          }
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                      title="Delete Department Folder"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* FILE LIST VIEW */
          <div className="bg-white rounded-3xl border border-secondary/15 shadow-sm overflow-hidden">
            {activeDocs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs">No documents uploaded. Click 'Upload Document' to add.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeDocs.map((doc) => (
                  <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-200/30">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <a
                          href={doc.fileUrl || "#"}
                          target={doc.fileUrl ? "_blank" : undefined}
                          onClick={(e) => {
                            if (!doc.fileUrl) {
                              e.preventDefault();
                              alert(`Simulated View/Download of "${doc.title}":\nThis document resides in local storage only. Full database storage will be connected in Phase 2.`);
                            }
                          }}
                          className="font-bold text-xs text-slate-800 hover:text-primary hover:underline transition-colors"
                          rel="noreferrer"
                        >
                          {doc.title}
                        </a>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {doc.fileName} • {doc.fileSize} • Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setNewTitle(doc.title);
                          setShowEditModal(true);
                        }}
                        className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                      >
                        Edit File Name
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                            deleteDocument(doc.id);
                            showToast("Document deleted successfully");
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                        title="Delete Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD FOLDER MODAL */}
        {showAddFolderModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
              <h3 className="text-lg font-black text-slate-800 mb-2">Create Department Folder</h3>
              <p className="text-xs text-gray-500 mb-4 font-semibold leading-relaxed">
                Create a new administrative department directory for storing files.
              </p>

              <form onSubmit={handleAddFolderSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Folder / Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance Department"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Description</label>
                  <textarea
                    placeholder="e.g. Budget audits, fee invoices and payment records."
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderName("");
                      setNewFolderDesc("");
                      setShowAddFolderModal(false);
                    }}
                    className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FILE UPLOAD MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Upload PDF Document
              </h3>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {uploadError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Document Title Metadata</label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="e.g. Standard PIBG Guideline"
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    disabled={isUploading}
                  />
                </div>

                {isUploading ? (
                  <div className="space-y-2 p-6 bg-slate-50 rounded-2xl text-center">
                    <div className="text-xs font-black text-primary animate-pulse">Ingesting text for agentic AI tools...</div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1">is_extracted_for_ai = FALSE</div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="border-2 border-dashed border-secondary/20 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedUploadFile(file);
                            setFileTitle(file.name.replace(/\.[^/.]+$/, ""));
                            setUploadError("");
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                        <span className="text-xs font-bold text-slate-700">
                          {selectedUploadFile ? selectedUploadFile.name : "Choose or drag any actual file"}
                        </span>
                        <span className="text-[9px] text-gray-450 font-bold">
                          {selectedUploadFile ? `${Math.round(selectedUploadFile.size / 1024)} KB` : "Supports PDF, DOC, DOCX"}
                        </span>
                      </div>
                    </div>

                    {selectedUploadFile && (
                      <button
                        type="button"
                        onClick={() => triggerUpload(selectedUploadFile)}
                        className="w-full bg-primary border-2 border-secondary text-white font-bold py-3.5 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        Process & Upload File
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowUploadModal(false)}
                  className="bg-white hover:bg-slate-50 border border-secondary/15 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT DOCUMENT METADATA MODAL */}
        {showEditModal && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                ✏️ Edit Document Metadata
              </h3>

              <form onSubmit={handleEditMetaSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
