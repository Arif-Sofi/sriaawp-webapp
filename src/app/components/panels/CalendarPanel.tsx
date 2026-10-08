"use client";

import React, { useState } from "react";
import { usePortal, CalendarEvent } from "../../(portal)/context/PortalContext";
import Toast, { useToast } from "../Toast";

export default function CalendarPanel() {
  const {
    currentRole,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    importEventsCSV
  } = usePortal();

  const { toast, showToast } = useToast();

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CalendarEvent | null>(null);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("Main Hall");
  const [editStartDate, setEditStartDate] = useState("2026-07-01");
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndDate, setEditEndDate] = useState("2026-07-01");
  const [editEndTime, setEditEndTime] = useState("11:00");
  const [editDescription, setEditDescription] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Form State for Event Creation
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Main Hall");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("2026-07-01");
  const [endTime, setEndTime] = useState("11:00");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter an event title");
      return;
    }

    const res = addEvent(title, location, startDate, startTime, endDate, endTime, description);
    if (!res.success) {
      setErrorMsg(res.error || "Conflict detected.");
      return;
    }

    showToast("Event published successfully");
    setTitle("");
    setDescription("");
    setShowAddModal(false);
  };

  const startEdit = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setEditTitle(evt.title);
    setEditLocation(evt.location);
    setEditStartDate(evt.startDate);
    setEditStartTime(evt.startTime);
    setEditEndDate(evt.endDate);
    setEditEndTime(evt.endTime);
    setEditDescription(evt.description || "");
    setEditErrorMsg("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg("");

    if (!editTitle.trim()) {
      setEditErrorMsg("Please enter an event title");
      return;
    }

    if (updateEvent && editingEvent) {
      const res = updateEvent(editingEvent.id, editTitle, editLocation, editStartDate, editStartTime, editEndDate, editEndTime, editDescription);
      if (!res.success) {
        setEditErrorMsg(res.error || "Conflict detected.");
        return;
      }

      showToast("Event updated successfully");
      setEditingEvent(null);
    }
  };

  const handleImport = (fileName: string) => {
    importEventsCSV(fileName);
    showToast("Imported 3 events successfully.");
    setShowImportModal(false);
  };

  // Monthly calendar calculation for July 2026 (our demo focus)
  const calendarYear = 2026;
  const calendarMonthIndex = 6; // July (0-indexed)
  const daysInMonth = 31;
  const startDayOfWeek = 3; // July 1st, 2026 is Wednesday (Sunday is 0)

  const calendarDays = [];
  // Padding cells for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)] font-montserrat">
      <Toast toast={toast} />

      <div className="space-y-6">
        {/* Header Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-secondary/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">School Calendar (Takwim)</h2>
            <p className="text-xs text-gray-500 font-bold">Conflict-free venue booking system</p>
          </div>

          {/* View Mode Toggle & Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Toggle buttons */}
            <div className="flex bg-slate-100 border border-secondary/15 rounded-xl p-1 shadow-inner text-xs font-bold">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === "calendar"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:text-slate-800"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:text-slate-800"
                }`}
              >
                List View
              </button>
            </div>

            {/* Action Controls for Teachers/Admins */}
            {(currentRole === "admin" || currentRole === "teacher") && (
              <div className="flex gap-2 ml-auto sm:ml-0">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import (CSV)
                </button>
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setShowAddModal(true);
                  }}
                  className="bg-primary text-white hover:bg-primary/95 font-bold px-3 py-2 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VIEW MODES */}
        {viewMode === "calendar" ? (
          /* 1. VISUAL MONTH CALENDAR VIEW (DEFAULT) */
          <div className="bg-white rounded-3xl border border-secondary/15 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                July 2026
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded font-black">
                Standard School Takwim
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Weekdays header */}
              {weekdays.map((day) => (
                <div key={day} className="text-center font-black text-[10px] text-gray-400 uppercase py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[90px] border border-slate-100 rounded-xl" />;
                }

                const formattedDay = day < 10 ? `0${day}` : `${day}`;
                const dateStr = `2026-07-${formattedDay}`;
                const dayEvents = events.filter((evt) => evt.startDate === dateStr);

                return (
                  <div
                    key={`day-${day}`}
                    className="bg-white border border-secondary/10 rounded-xl p-2 min-h-[90px] flex flex-col justify-between hover:bg-slate-50/20 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-gray-500 self-end">{day}</span>
                    <div className="space-y-1 flex-1 mt-1 overflow-hidden">
                      {dayEvents.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEventDetail(evt)}
                          className="w-full text-left bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] px-1.5 py-1 rounded truncate block hover:scale-102 transition-transform cursor-pointer"
                          title={evt.title}
                        >
                          {evt.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 2. CHRONOLOGICAL LIST VIEW */
          <div className="bg-white rounded-3xl border border-secondary/15 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 text-xs font-bold text-gray-500 grid grid-cols-12 border-b border-secondary/10">
              <div className="col-span-5 sm:col-span-3">Event details</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-4 sm:col-span-2">Time range</div>
              <div className="col-span-2 hidden sm:block">Timezone</div>
              <div className="col-span-2"> Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
              {events.map((evt) => (
                <div key={evt.id} className="p-5 text-xs grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors">
                  <div className="col-span-5 sm:col-span-3 font-bold text-slate-800 flex flex-col gap-0.5">
                    <span>{evt.title}</span>
                    {evt.description && <span className="text-[10px] font-normal text-gray-400 leading-snug mr-2">{evt.description}</span>}
                  </div>
                  <div className="col-span-3 font-semibold text-slate-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {evt.location}
                  </div>
                  <div className="col-span-4 sm:col-span-2 text-slate-500 font-medium">
                    <div>{evt.startDate}</div>
                    <div className="text-[10px] text-gray-400 font-semibold">{evt.startTime} - {evt.endTime}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pr-2">
                    <span className="hidden sm:inline font-bold text-primary ml-2">{evt.timezone}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pr-2">
                    {(currentRole === "admin" || currentRole === "teacher") && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(evt);
                          }}
                          className="p-1 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border border-transparent"
                          title="Edit Event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the event "${evt.title}"?`)) {
                              if (deleteEvent) {
                                deleteEvent(evt.id);
                                showToast("Event deleted successfully");
                              }
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                          title="Delete Event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENT DETAILS DIALOG MODAL */}
        {selectedEventDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  Event Information
                </h3>
                <button
                  onClick={() => setSelectedEventDetail(null)}
                  className="text-gray-400 hover:text-slate-600 font-black cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="font-bold text-gray-400">Event Title:</span>
                  <p className="font-black text-sm text-slate-800 mt-0.5">{selectedEventDetail.title}</p>
                </div>

                <div>
                  <span className="font-bold text-gray-400">Venue / Location:</span>
                  <p className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {selectedEventDetail.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-gray-400">Scheduled Date:</span>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedEventDetail.startDate}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Timezone Offset:</span>
                    <p className="font-bold text-primary mt-0.5">{selectedEventDetail.timezone} (Kuala Lumpur)</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-gray-400">Booking Time Range:</span>
                  <p className="font-bold text-slate-700 mt-0.5">
                    {selectedEventDetail.startTime} to {selectedEventDetail.endTime}
                  </p>
                </div>

                {selectedEventDetail.description && (
                  <div>
                    <span className="font-bold text-gray-400">Description:</span>
                    <p className="font-bold text-slate-700 mt-0.5 whitespace-pre-wrap">{selectedEventDetail.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 gap-2">
                {(currentRole === "admin" || currentRole === "teacher") && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the event "${selectedEventDetail.title}"?`)) {
                          if (deleteEvent) {
                            deleteEvent(selectedEventDetail.id);
                            setSelectedEventDetail(null);
                            showToast("Event deleted successfully");
                          }
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors mr-auto"
                    >
                      Delete Event
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventDetail(null);
                        startEdit(selectedEventDetail);
                      }}
                      className="bg-white border border-secondary/15 hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      Edit Event
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEventDetail(null)}
                  className="bg-primary text-white hover:bg-primary/95 border border-secondary font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE EVENT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative animate-fadeIn flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                Create Takwim Event
              </h3>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PIBG Annual Meeting"
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Location / Venue</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Meeting Room A">Meeting Room A</option>
                    <option value="PIBG Room">PIBG Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
                  <textarea
                    placeholder="e.g. Planning session for the new school year."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setEndDate(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Timezone</label>
                    <input
                      type="text"
                      disabled
                      value="UTC+08:00 (Kuala Lumpur)"
                      className="w-full bg-slate-100 border border-secondary/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Timezone safe inputs (kept raw local time strings) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
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
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT EVENT MODAL */}
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative animate-fadeIn flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                Edit Takwim Event
              </h3>

              {editErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {editErrorMsg}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. PIBG Annual Meeting"
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Location / Venue</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Meeting Room A">Meeting Room A</option>
                    <option value="PIBG Room">PIBG Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
                  <textarea
                    placeholder="e.g. Planning session for the new school year."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => {
                        setEditStartDate(e.target.value);
                        setEditEndDate(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Timezone</label>
                    <input
                      type="text"
                      disabled
                      value="UTC+08:00 (Kuala Lumpur)"
                      className="w-full bg-slate-100 border border-secondary/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Timezone safe inputs (kept raw local time strings) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">End Time</label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-secondary/20 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
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

        {/* IMPORT EVENT MODAL */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl border border-secondary/15 max-w-md w-full shadow-2xl p-6 relative flex flex-col gap-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                Import Events Spreadsheet
              </h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Upload a `.csv` or `.xlsx` file containing the bulk schedule of school activities. The parser will check for collision clashing before loading events.
              </p>

              <div
                onClick={() => handleImport("calendar_events.csv")}
                className="border-2 border-dashed border-secondary/20 rounded-2xl p-8 hover:border-primary hover:bg-primary/5 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <svg className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-xs font-bold text-slate-700">Drag calendar_events.csv here</div>
                <div className="text-[10px] text-gray-400 font-bold">Or click to select from file system (Auto-Ingests demo)</div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-white hover:bg-slate-50 border border-secondary/15 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
