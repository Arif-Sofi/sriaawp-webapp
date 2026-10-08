"use client";

import React, { useState } from "react";
import { usePortal, RoleType, UserProfile, AchievementSubmission, CocurricularGroup } from "../../(portal)/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function CocurricularPanel() {
  const {
    currentRole,
    users,
    achievements,
    submitAchievement,
    reviewAchievement,
    studentGroups,
    cocurricularGroups,
    addCocurricularGroup,
    updateCocurricularGroup,
    deleteCocurricularGroup,
    addStudentToCocurricularGroup,
    removeStudentFromCocurricularGroup,
    updateUserProfile
  } = usePortal();

  const { toast, showToast } = useToast();

  // Navigation tabs for staff
  const [subTab, setSubTab] = useState<"groups" | "pending" | "history">("groups");
  
  // Drill-down group ID
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Group creation & edit modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CocurricularGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<"club" | "sports" | "uniform">("club");

  // Student enrollment/editing modal states
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollMode, setEnrollMode] = useState<"existing" | "new">("existing");
  const [existingStudentId, setExistingStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");

  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentPhone, setEditStudentPhone] = useState("");

  const [viewingStudent, setViewingStudent] = useState<UserProfile | null>(null);

  // Certificate review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementSubmission | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [zoomImage, setZoomImage] = useState(false);

  // Submit achievement form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementCategory, setAchievementCategory] = useState("Scouts");

  const studentRoleObj = users.find((u) => u.role === "student") || { id: "student-uuid-111", name: "Ali bin Abu" };
  const linkedStudentId = "student-uuid-111"; // Ahmad's child Ali bin Abu
  const childProfile = users.find(u => u.id === linkedStudentId) || { id: linkedStudentId, name: "Ali bin Abu" };
  const childGroups = studentGroups[linkedStudentId] || [];
  const childAchievements = achievements.filter(a => a.studentId === linkedStudentId);

  // Resolve group currently drilled into
  const activeGroup = cocurricularGroups.find(g => g.id === selectedGroupId);

  const handleAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementTitle.trim()) return;

    submitAchievement(achievementTitle, achievementCategory, "badminton_cert.png");
    showToast("Achievement submitted for review.");
    setAchievementTitle("");
    setShowSubmitModal(false);
  };

  const handleApprove = (id: string) => {
    reviewAchievement(id, "approved");
    showToast("Application approved");
    setShowReviewModal(false);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() || !selectedAchievement) return;

    reviewAchievement(selectedAchievement.id, "rejected", rejectReason);
    showToast("Application rejected", "error");
    setRejectReason("");
    setShowRejectForm(false);
    setShowReviewModal(false);
  };

  // Group handlers
  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupName("");
    setGroupType("club");
    setShowGroupModal(true);
  };

  const openEditGroup = (g: CocurricularGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(g);
    setGroupName(g.name);
    setGroupType(g.type);
    setShowGroupModal(true);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editingGroup) {
      updateCocurricularGroup(editingGroup.id, groupName.trim(), groupType);
      showToast("Group updated successfully");
    } else {
      addCocurricularGroup(groupName.trim(), groupType);
      showToast("Group created successfully");
    }
    setShowGroupModal(false);
  };

  const handleDeleteGroup = (g: CocurricularGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the group "${g.name}"? All student memberships in this group will be unlinked.`)) {
      deleteCocurricularGroup(g.id);
      showToast("Group deleted successfully");
      if (selectedGroupId === g.id) {
        setSelectedGroupId(null);
      }
    }
  };

  // Student handlers in drill-down list
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    if (enrollMode === "existing") {
      if (!existingStudentId) return;
      addStudentToCocurricularGroup(selectedGroupId, existingStudentId);
      showToast("Student added to group");
      setShowEnrollModal(false);
      setExistingStudentId("");
    } else {
      if (!newStudentName.trim() || !newStudentEmail.trim()) return;
      const tempId = `student-${Date.now()}`;
      const newStud: UserProfile = {
        id: tempId,
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        phone: newStudentPhone.trim(),
        role: "student",
        isVerified: true
      };
      
      users.push(newStud); // Pre-inject into memory users list
      addStudentToCocurricularGroup(selectedGroupId, tempId);
      showToast("New student registered and enrolled");
      
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentPhone("");
      setShowEnrollModal(false);
    }
  };

  const handleStudentRemove = (studentId: string) => {
    if (!selectedGroupId) return;
    if (confirm("Are you sure you want to remove this student from the group?")) {
      removeStudentFromCocurricularGroup(selectedGroupId, studentId);
      showToast("Student removed from group");
    }
  };

  const openEditStudent = (stud: UserProfile) => {
    setEditingStudent(stud);
    setEditStudentName(stud.name);
    setEditStudentEmail(stud.email);
    setEditStudentPhone(stud.phone);
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim()) return;

    updateUserProfile(editingStudent.id, editStudentName.trim(), editStudentEmail.trim(), editStudentPhone.trim());
    showToast("Student details updated successfully");
    setEditingStudent(null);
  };

  if (currentRole === "public") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
        <div className="p-8 bg-white border border-red-200 text-red-500 font-bold rounded-2xl">
          Access Denied: Authorized student or staff credentials required.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-secondary/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Cocurricular Record System</h2>
            <p className="text-xs text-gray-500 font-bold">Groups memberships & external certificates review</p>
          </div>

          {/* Action button based on tab and role */}
          {currentRole === "student" && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 border border-secondary"
            >
              Add Achievement Submission
            </button>
          )}

          {(currentRole === "teacher" || currentRole === "admin") && !selectedGroupId && subTab === "groups" && (
            <button
              onClick={openCreateGroup}
              className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5 border border-secondary"
            >
              Create Cocurricular Group
            </button>
          )}
        </div>

        {/* Staff View Tabs Switcher */}
        {(currentRole === "teacher" || currentRole === "admin") && (
          <div className="flex bg-slate-100 border border-secondary/15 rounded-xl p-1 shadow-inner text-xs font-bold w-fit">
            <button
              onClick={() => { setSubTab("groups"); setSelectedGroupId(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                subTab === "groups" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-slate-800"
              }`}
            >
              Groups Directory
            </button>
            <button
              onClick={() => { setSubTab("pending"); setSelectedGroupId(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                subTab === "pending" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-slate-800"
              }`}
            >
              <span>Pending Applications By Group</span>
              {achievements.filter(a => a.status === "pending").length > 0 && (
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => { setSubTab("history"); setSelectedGroupId(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                subTab === "history" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-slate-800"
              }`}
            >
              Certificates History
            </button>
          </div>
        )}

        {/* 1. STUDENT VIEW */}
        {currentRole === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-200/50">
                  <span className="text-xl">🎖️</span>
                </div>
                <div>
                  <h3 className="font-black text-xs text-slate-800">Cocurricular Groups</h3>
                  <p className="text-[10px] text-gray-400 font-bold">Registered Memberships</p>
                </div>
              </div>

              <div className="space-y-2">
                {(studentGroups[studentRoleObj.id] || []).map((group, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-secondary/5 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">{group}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">Active</span>
                  </div>
                ))}
                {(studentGroups[studentRoleObj.id] || []).length === 0 && (
                  <p className="text-xs text-gray-400">Not assigned to any club.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm col-span-2">
              <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Achievement Submissions Registry
              </h3>

              <div className="space-y-3">
                {achievements
                  .filter((a) => a.studentId === studentRoleObj.id)
                  .map((ach) => (
                    <div key={ach.id} className="p-4 border border-secondary/10 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{ach.title}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold">{ach.category} • {ach.evidenceName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {ach.status === "pending" && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Pending Review</span>
                        )}
                        {ach.status === "approved" && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Approved</span>
                        )}
                        {ach.status === "rejected" && (
                          <div className="text-right">
                            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Rejected</span>
                            {ach.rejectionReason && (
                              <p className="text-[9px] text-red-600 font-semibold mt-1">Reason: "{ach.rejectionReason}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PARENT VIEW */}
        {currentRole === "parent" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-200/50">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-black text-xs text-slate-800">Linked Child Profile</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Guardian node association</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-secondary/5 rounded-2xl space-y-3.5 text-xs">
                <div>
                  <span className="font-bold text-gray-400">Child Name:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{childProfile.name}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-400">Student ID Reference:</span>
                  <p className="font-bold text-slate-600 mt-0.5">{childProfile.id}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-400">Co-curricular Groups:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {childGroups.map((g, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        {g}
                      </span>
                    ))}
                    {childGroups.length === 0 && <span className="text-gray-400">No club memberships</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm col-span-2 flex flex-col gap-4">
              <div>
                <h3 className="font-black text-sm text-slate-900">Child Co-curricular Achievement Log</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Verifying certificates submitted</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                {childAchievements.map((ach) => (
                  <div key={ach.id} className="p-4 border border-secondary/10 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{ach.title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{ach.category} • Proof: {ach.evidenceName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ach.status === "pending" && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Pending Review</span>
                      )}
                      {ach.status === "approved" && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Approved</span>
                      )}
                      {ach.status === "rejected" && (
                        <div className="text-right">
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Rejected</span>
                          {ach.rejectionReason && (
                            <p className="text-[9px] text-red-600 font-semibold mt-1">Reason: "{ach.rejectionReason}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. STAFF GROUPS DIRECTORY TAB */}
        {(currentRole === "teacher" || currentRole === "admin") && subTab === "groups" && !selectedGroupId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {cocurricularGroups.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-44 group relative overflow-hidden"
              >
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                    g.type === "club" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    g.type === "sports" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {g.type}
                  </span>
                  <h4 className="text-base font-black text-slate-800 group-hover:text-primary transition-colors mt-2">{g.name}</h4>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <span>👥</span> {g.studentIds.length} Enrolled Students
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => openEditGroup(g, e)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteGroup(g, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cocurricularGroups.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs text-gray-400 bg-white border border-secondary/10 rounded-3xl shadow-inner">
                No cocurricular groups created yet. Click "Create Cocurricular Group" to add one.
              </div>
            )}
          </div>
        )}

        {/* 4. DRILL DOWN GROUP MEMBERS LIST VIEW */}
        {(currentRole === "teacher" || currentRole === "admin") && subTab === "groups" && selectedGroupId && activeGroup && (
          <div className="space-y-6 animate-fadeIn">
            <button
              onClick={() => setSelectedGroupId(null)}
              className="text-xs font-bold text-gray-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              ← Back to Groups Directory
            </button>

            <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-800">{activeGroup.name} Members</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 capitalize">{activeGroup.type}</span>
                </div>
                <p className="text-xs text-gray-400 font-semibold mt-1">Manage and edit enrolled students inside this co-curricular node</p>
              </div>
              
              <button
                onClick={() => setShowEnrollModal(true)}
                className="bg-primary text-white hover:bg-primary/95 border border-secondary font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5"
              >
                <span>➕</span> Add Student to Group
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-secondary/15 shadow-sm overflow-hidden">
              <table className="w-full border-collapse text-left text-xs font-montserrat">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold border-b border-secondary/10">
                    <th className="p-4">Student details</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeGroup.studentIds.map(sid => {
                    const stud = users.find(u => u.id === sid) || { id: sid, name: "Ali bin Abu", email: "newtest@gmail.com", phone: "0123456789", role: "student" as RoleType, isVerified: true };
                    return (
                      <tr key={sid} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{stud.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stud.id}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600">{stud.email}</td>
                        <td className="p-4 font-medium text-slate-500">{stud.phone || "No record"}</td>
                        <td className="p-4 text-right pr-6 space-x-1.5">
                          <button
                            onClick={() => setViewingStudent(stud)}
                            className="bg-slate-50 hover:bg-slate-100 border border-secondary/10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                            title="View student co-curricular profile"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => openEditStudent(stud)}
                            className="bg-slate-50 hover:bg-slate-100 border border-secondary/10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                            title="Edit student information"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleStudentRemove(sid)}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-600 cursor-pointer"
                            title="Remove from group"
                          >
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {activeGroup.studentIds.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-gray-400 font-semibold">
                        No students enrolled in this group. Click "Add Student to Group" to enroll one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PENDING APPLICATIONS BY COCURRICULAR GROUP VIEW */}
        {(currentRole === "teacher" || currentRole === "admin") && subTab === "pending" && (
          <div className="space-y-6 animate-fadeIn">
            {cocurricularGroups.map((g) => {
              const groupPendings = achievements.filter(
                (a) => a.status === "pending" && a.category.toLowerCase() === g.name.toLowerCase()
              );

              return (
                <div key={g.id} className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900">{g.name} Submissions Queue</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border font-bold capitalize">{g.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      groupPendings.length > 0 ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-slate-50 text-gray-400 border-slate-200"
                    }`}>
                      {groupPendings.length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupPendings.map((ach) => (
                      <div
                        key={ach.id}
                        className="p-4 border border-secondary/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{ach.title}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Submitted by {ach.studentName} ({ach.studentId}) • {ach.evidenceName}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedAchievement(ach);
                            setZoomImage(false);
                            setShowRejectForm(false);
                            setShowReviewModal(true);
                          }}
                          className="bg-primary text-white hover:bg-primary/95 border border-secondary font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-all shadow self-end sm:self-center"
                        >
                          Review Application
                        </button>
                      </div>
                    ))}
                    {groupPendings.length === 0 && (
                      <p className="text-center py-4 text-gray-400 text-xs font-semibold">No pending certificate applications for this group.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. STAFF CERTIFICATES HISTORY TAB */}
        {(currentRole === "teacher" || currentRole === "admin") && subTab === "history" && (
          <div className="bg-white rounded-3xl border border-secondary/15 p-6 shadow-sm space-y-4 animate-fadeIn">
            <div>
              <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3">Reviewed Applications History</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Audit log of approved and rejected co-curricular files</p>
            </div>

            <div className="space-y-3">
              {achievements
                .filter(a => a.status !== "pending")
                .map(ach => (
                  <div key={ach.id} className="p-4 border border-secondary/10 rounded-2xl flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{ach.title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Student: {ach.studentName} ({ach.studentId}) • Group: {ach.category}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {ach.status === "approved" ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Approved</span>
                      ) : (
                        <div className="text-right">
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Rejected</span>
                          {ach.rejectionReason && (
                            <p className="text-[9px] text-red-500 font-bold mt-0.5">"{ach.rejectionReason}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {achievements.filter(a => a.status !== "pending").length === 0 && (
                <div className="text-center py-10 text-gray-400">No applications have been reviewed yet.</div>
              )}
            </div>
          </div>
        )}

        {/* CREATE & EDIT GROUP MODAL */}
        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                {editingGroup ? "Edit Cocurricular Group" : "Create Cocurricular Group"}
              </h3>

              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Group / Club Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soccer Team"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Group Type Classification</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value as "club" | "sports" | "uniform")}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="club">Club / Society</option>
                    <option value="sports">Sports Club</option>
                    <option value="uniform">Uniformed Body</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                  >
                    {editingGroup ? "Save Changes" : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT ENROLLMENT MODAL */}
        {showEnrollModal && activeGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Enroll Student to {activeGroup.name}
              </h3>

              <div className="flex bg-slate-100 border border-secondary/10 rounded-xl p-1 text-xs font-bold w-full mb-2">
                <button
                  type="button"
                  onClick={() => setEnrollMode("existing")}
                  className={`flex-1 py-2 rounded-lg cursor-pointer transition-colors ${
                    enrollMode === "existing" ? "bg-primary text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Enroll Existing Student
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollMode("new")}
                  className={`flex-1 py-2 rounded-lg cursor-pointer transition-colors ${
                    enrollMode === "new" ? "bg-primary text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Register & Enroll New Student
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                {enrollMode === "existing" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Choose Existing Student</label>
                    <select
                      value={existingStudentId}
                      onChange={(e) => setExistingStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="">-- Select Student --</option>
                      {users
                        .filter(u => u.role === "student" && !activeGroup.studentIds.includes(u.id))
                        .map(stud => (
                          <option key={stud.id} value={stud.id}>
                            {stud.name} ({stud.id})
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Adam"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. adam@email.com"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 012345678"
                        value={newStudentPhone}
                        onChange={(e) => setNewStudentPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT STUDENT METADATA MODAL */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                ✏️ Edit Student Info
              </h3>

              <form onSubmit={handleEditStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Student ID Reference</label>
                  <input
                    type="text"
                    disabled
                    value={editingStudent.id}
                    className="w-full bg-slate-100 border border-secondary/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editStudentEmail}
                    onChange={(e) => setEditStudentEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
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

        {/* VIEW STUDENT PROFILE DETAIL MODAL */}
        {viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                🎓 Student Cocurricular Profile
              </h3>

              <div className="space-y-4 text-xs font-montserrat">
                <div className="p-4 bg-slate-50 border border-secondary/5 rounded-2xl space-y-3">
                  <div>
                    <span className="font-bold text-gray-400">Name:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{viewingStudent.name}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">ID Reference:</span>
                    <p className="font-bold text-slate-600 mt-0.5">{viewingStudent.id}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Contact Address:</span>
                    <p className="font-semibold text-slate-500 mt-0.5">{viewingStudent.email} • {viewingStudent.phone || "No phone record"}</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 mb-1.5 block">Enrolled Groups & Clubs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cocurricularGroups
                      .filter(g => g.studentIds.includes(viewingStudent.id))
                      .map(g => (
                        <span key={g.id} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                          {g.name} ({g.type})
                        </span>
                      ))}
                    {cocurricularGroups.filter(g => g.studentIds.includes(viewingStudent.id)).length === 0 && (
                      <span className="text-gray-400 italic">No group memberships registered.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 mb-1.5 block">Certificate Achievements Submissions:</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {achievements
                      .filter(a => a.studentId === viewingStudent.id)
                      .map(a => (
                        <div key={a.id} className="p-2 border border-secondary/10 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{a.title}</div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase">{a.category}</div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            a.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            a.status === "pending" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    {achievements.filter(a => a.studentId === viewingStudent.id).length === 0 && (
                      <span className="text-gray-400 italic">No achievements certificate files uploaded yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="bg-primary text-white hover:bg-primary/95 border border-secondary font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT SUBMISSION FORM MODAL */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Submit Achievement Proof
              </h3>

              <form onSubmit={handleAchievementSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Achievement / Award Name</label>
                  <input
                    type="text"
                    required
                    value={achievementTitle}
                    onChange={(e) => setAchievementTitle(e.target.value)}
                    placeholder="e.g. Regional Badminton Silver"
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Cocurricular Club Category</label>
                  <select
                    value={achievementCategory}
                    onChange={(e) => setAchievementCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {cocurricularGroups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Upload Certificate File Proof</label>
                  <div className="border border-dashed border-secondary/20 rounded-xl p-4 text-center bg-slate-50">
                    <span className="text-lg">🖼️</span>
                    <p className="text-[10px] text-slate-700 font-bold mt-1">badminton_cert.png selected</p>
                    <p className="text-[8px] text-gray-400 font-bold">(Auto-selected demo evidence for TC017)</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TEACHER REVIEW AND ZOOM MODAL */}
        {showReviewModal && selectedAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Review Achievement Application
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-400">Student:</span> {selectedAchievement.studentName} ({selectedAchievement.studentId})</p>
                  <p><span className="font-bold text-slate-400">Award:</span> {selectedAchievement.title}</p>
                  <p><span className="font-bold text-slate-400">Category:</span> {selectedAchievement.category}</p>
                  <p><span className="font-bold text-slate-400">Submitted At:</span> {selectedAchievement.submittedAt.split("T")[0]}</p>
                </div>

                <div className="border border-secondary/10 rounded-xl p-3 bg-slate-50 flex flex-col items-center">
                  <label className="block text-[10px] text-gray-500 font-black mb-2 self-start uppercase">Certificate Proof (Click to zoom):</label>
                  
                  <div
                    onClick={() => setZoomImage(!zoomImage)}
                    className={`border border-secondary/20 rounded-lg overflow-hidden bg-white shadow-inner cursor-pointer transition-all ${
                      zoomImage ? "fixed inset-8 z-55 p-12 bg-black/90 flex flex-col items-center justify-center animate-fadeIn" : "w-40 h-28 relative hover:scale-102"
                    }`}
                  >
                    {zoomImage ? (
                      <div className="flex flex-col items-center justify-center gap-4 relative w-full h-full">
                        <button className="absolute top-4 right-4 bg-white text-slate-900 px-4 py-2 font-bold rounded-full cursor-pointer text-xs shadow-md border border-slate-200">
                          ✕ Close Zoom
                        </button>
                        <div className="w-full max-w-lg h-5/6 border-4 border-white/95 bg-slate-900 flex items-center justify-center text-white text-2xl font-black rounded-lg">
                          🎖️ BADMINTON CERTIFICATE FULL-RES
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold text-xs bg-slate-100">
                        <span>🖼️</span>
                        <span className="text-[9px] mt-1 font-semibold">{selectedAchievement.evidenceName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {showRejectForm ? (
                  <form onSubmit={handleRejectSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Reason for Rejection</label>
                      <input
                        type="text"
                        required
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Evidence certificate file is illegible"
                        className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="bg-white border border-secondary/15 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-red-650 text-white hover:bg-red-700 font-bold px-3.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                      >
                        Reject Certificate
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="bg-white border border-secondary/15 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      Close
                    </button>
                    {(currentRole === "teacher" || currentRole === "admin") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(selectedAchievement.id)}
                          className="bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
