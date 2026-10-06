"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "admin" | "teacher" | "student" | "parent" | "public";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  linkedStudentId?: string;
  isVerified?: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface SchoolDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  department: string;
  isExtractedForAi: boolean;
  textContent: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  location: string;
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endDate: string;
  endTime: string;
  timezone: string; // "+08:00"
  description?: string;
}

export interface CocurricularGroup {
  id: string;
  name: string;
  type: "club" | "sports" | "uniform";
  studentIds: string[];
}

export interface SchoolMemo {
  id: string;
  title: string;
  content: string;
  date: string;
  isArchived: boolean;
}

export interface AchievementSubmission {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  category: string;
  evidenceName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  referenceDoc?: string;
}

interface PortalContextProps {
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  users: UserProfile[];
  updateUserRole: (id: string, newRole: RoleType) => void;
  deleteUser: (id: string) => void;
  departments: Department[];
  addDepartment: (name: string, description: string) => void;
  deleteDepartment: (id: string) => void;
  documents: SchoolDocument[];
  uploadDocument: (dept: string, title: string, fileName: string, sizeBytes: number, fileUrl?: string) => Promise<string>;
  updateDocumentMetadata: (id: string, newTitle: string) => void;
  deleteDocument: (id: string) => void;
  events: CalendarEvent[];
  addEvent: (title: string, location: string, startDate: string, startTime: string, endDate: string, endTime: string, description?: string) => { success: boolean; error?: string };
  updateEvent: (id: string, title: string, location: string, startDate: string, startTime: string, endDate: string, endTime: string, description?: string) => { success: boolean; error?: string };
  deleteEvent: (id: string) => void;
  importEventsCSV: (fileName: string) => void;
  memos: SchoolMemo[];
  addMemo: (title: string, content: string) => void;
  updateMemo: (id: string, title: string, content: string) => void;
  deleteMemo: (id: string) => void;
  achievements: AchievementSubmission[];
  submitAchievement: (title: string, category: string, fileName: string) => void;
  reviewAchievement: (id: string, status: "approved" | "rejected", reason?: string) => void;
  studentGroups: Record<string, string[]>;
  cocurricularGroups: CocurricularGroup[];
  addCocurricularGroup: (name: string, type: "club" | "sports" | "uniform") => void;
  updateCocurricularGroup: (id: string, name: string, type: "club" | "sports" | "uniform") => void;
  deleteCocurricularGroup: (id: string) => void;
  addStudentToCocurricularGroup: (groupId: string, studentId: string) => void;
  removeStudentFromCocurricularGroup: (groupId: string, studentId: string) => void;
  updateUserProfile: (id: string, name: string, email: string, phone: string) => void;
  addStudentToGroup: (studentId: string, groupName: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  resetAllState: () => void;
  registerUser: (name: string, email: string, phone: string, role: RoleType) => UserProfile;
  verifyUser: (id: string) => void;
}

const PortalContext = createContext<PortalContextProps | undefined>(undefined);

const defaultUsers: UserProfile[] = [
  { id: "admin-uuid-333", name: "HOD Sarah", email: "admin@email.com", phone: "0198765432", role: "admin", isVerified: true },
  { id: "teacher-uuid-222", name: "Arif Sofi", email: "teacher@school.edu", phone: "0112233445", role: "teacher", isVerified: true },
  { id: "student-uuid-111", name: "Ali bin Abu", email: "newtest@gmail.com", phone: "0123456789", role: "student", isVerified: true },
  { id: "parent-uuid-444", name: "Ahmad (Parent of Ali)", email: "parent@email.com", phone: "0176543210", role: "parent", linkedStudentId: "student-uuid-111", isVerified: true }
];

const defaultDepartments: Department[] = [
  { id: "dept-1", name: "Student Affairs", description: "Managing student registration and general welfare" },
  { id: "dept-2", name: "Academic Department", description: "Handling curricula, timetables, and exams" }
];

const defaultDocuments: SchoolDocument[] = [
  {
    id: "doc-1",
    title: "Student Conduct Policy",
    fileName: "student_conduct_policy.pdf",
    fileSize: "245 KB",
    department: "Student Affairs",
    isExtractedForAi: true,
    textContent: "Welcome to SRIAAWP! Co-curricular activity attendance is compulsory. The deadline for submitting any cocurricular achievement proof is 2 weeks after the event. All certificates must be signed by the main club teacher.",
    uploadedAt: "2026-06-10T10:00:00+08:00"
  },
  {
    id: "doc-2",
    title: "Standard PIBG Guideline",
    fileName: "pibg_guidelines_2026.pdf",
    fileSize: "512 KB",
    department: "Student Affairs",
    isExtractedForAi: true,
    textContent: "PIBG guidelines for 2026 state that the deadline for PIBG payment is 2026-07-15. Late payments will require approval from the Head of Department. Venue for annual meeting is PIBG Room. Sports Day is scheduled on 2026-07-10.",
    uploadedAt: "2026-06-12T14:30:00+08:00"
  }
];

const defaultEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Sports Day",
    location: "School Field",
    startDate: "2026-07-10",
    startTime: "08:00",
    endDate: "2026-07-10",
    endTime: "14:00",
    timezone: "+08:00"
  },
  {
    id: "event-2",
    title: "PIBG Annual Meeting",
    location: "PIBG Room",
    startDate: "2026-07-01",
    startTime: "09:00",
    endDate: "2026-07-01",
    endTime: "11:00",
    timezone: "+08:00"
  }
];

const defaultMemos: SchoolMemo[] = [
  {
    id: "memo-uuid-888",
    title: "PIBG Fee Deadline Notice",
    content: "Assalamu'alaikum parents, please be informed that the PIBG registration fee must be completed by 15th July 2026. The meeting will take place in the PIBG Room on 1st July.",
    date: "2026-06-25",
    isArchived: false
  },
  {
    id: "memo-2",
    title: "School Uniform Updates",
    content: "All students are required to wear complete school uniform starting next week. Thank you for your cooperation.",
    date: "2026-06-20",
    isArchived: false
  }
];

const defaultAchievements: AchievementSubmission[] = [
  {
    id: "achievement-uuid-333",
    studentId: "student-uuid-111",
    studentName: "Ali bin Abu",
    title: "Regional Badminton Silver",
    category: "Badminton Club",
    evidenceName: "badminton_cert.png",
    status: "pending",
    submittedAt: "2026-06-25T16:00:00+08:00"
  }
];

const defaultStudentGroups: Record<string, string[]> = {
  "student-uuid-111": ["Scouts", "Chess Club"]
};

const defaultCocurricularGroups: CocurricularGroup[] = [
  { id: "group-1", name: "Scouts", type: "uniform", studentIds: ["student-uuid-111"] },
  { id: "group-2", name: "Chess Club", type: "club", studentIds: ["student-uuid-111"] },
  { id: "group-3", name: "Soccer Team", type: "sports", studentIds: [] },
  { id: "group-4", name: "Badminton Club", type: "sports", studentIds: [] }
];

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<RoleType>("student");
  const [users, setUsers] = useState<UserProfile[]>(defaultUsers);
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);
  const [documents, setDocuments] = useState<SchoolDocument[]>(defaultDocuments);
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [memos, setMemos] = useState<SchoolMemo[]>(defaultMemos);
  const [achievements, setAchievements] = useState<AchievementSubmission[]>(defaultAchievements);
  const [studentGroups, setStudentGroups] = useState<Record<string, string[]>>(defaultStudentGroups);
  const [cocurricularGroups, setCocurricularGroups] = useState<CocurricularGroup[]>(defaultCocurricularGroups);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am the SRIAAWP Agentic Assistant. How can I help you query school guidelines today?",
      timestamp: "14:00"
    }
  ]);

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("sriaawp_role");
      const storedUsers = localStorage.getItem("sriaawp_users");
      const storedDepts = localStorage.getItem("sriaawp_depts");
      const storedDocs = localStorage.getItem("sriaawp_docs");
      const storedEvents = localStorage.getItem("sriaawp_events");
      const storedMemos = localStorage.getItem("sriaawp_memos");
      const storedAchievements = localStorage.getItem("sriaawp_achievements");
      const storedGroups = localStorage.getItem("sriaawp_groups");
      const storedCocurr = localStorage.getItem("sriaawp_cocurr");
 
      if (storedRole) setCurrentRole(storedRole as RoleType);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedDepts) setDepartments(JSON.parse(storedDepts));
      if (storedDocs) setDocuments(JSON.parse(storedDocs));
      if (storedEvents) setEvents(JSON.parse(storedEvents));
      if (storedMemos) setMemos(JSON.parse(storedMemos));
      if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
      if (storedGroups) setStudentGroups(JSON.parse(storedGroups));
      if (storedCocurr) setCocurricularGroups(JSON.parse(storedCocurr));
      
      setHasLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("sriaawp_role", currentRole);
      localStorage.setItem("sriaawp_users", JSON.stringify(users));
      localStorage.setItem("sriaawp_depts", JSON.stringify(departments));
      localStorage.setItem("sriaawp_docs", JSON.stringify(documents));
      localStorage.setItem("sriaawp_events", JSON.stringify(events));
      localStorage.setItem("sriaawp_memos", JSON.stringify(memos));
      localStorage.setItem("sriaawp_achievements", JSON.stringify(achievements));
      localStorage.setItem("sriaawp_groups", JSON.stringify(studentGroups));
      localStorage.setItem("sriaawp_cocurr", JSON.stringify(cocurricularGroups));
    }
  }, [hasLoaded, currentRole, users, departments, documents, events, memos, achievements, studentGroups, cocurricularGroups]);

  const resetAllState = () => {
    setCurrentRole("student");
    setUsers(defaultUsers);
    setDepartments(defaultDepartments);
    setDocuments(defaultDocuments);
    setEvents(defaultEvents);
    setMemos(defaultMemos);
    setAchievements(defaultAchievements);
    setStudentGroups(defaultStudentGroups);
    setCocurricularGroups(defaultCocurricularGroups);
    setChatMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Hello! I am the SRIAAWP Agentic Assistant. How can I help you query school guidelines today?",
        timestamp: "14:00"
      }
    ]);
  };

  // UC04: Manage User Roles
  const updateUserRole = (id: string, newRole: RoleType) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // UC01: Register Account
  const registerUser = (name: string, email: string, phone: string, role: RoleType) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      isVerified: false,
      linkedStudentId: role === "parent" ? "student-uuid-111" : undefined
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  // UC03: Verify Registration
  const verifyUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isVerified: true } : u))
    );
  };

  // UC06: Add School Department
  const addDepartment = (name: string, description: string) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      description
    };
    setDepartments((prev) => [...prev, newDept]);
  };
  // UC06: Delete School Department
  const deleteDepartment = (id: string) => {
    const deptToDelete = departments.find(d => d.id === id);
    if (!deptToDelete) return;
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setDocuments((prev) => prev.filter((doc) => doc.department !== deptToDelete.name));
  };
  // UC05: Upload Document & UC07: Automated Text Ingestion
  const uploadDocument = async (dept: string, title: string, fileName: string, sizeBytes: number, fileUrl?: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate network & AI extraction delay
      setTimeout(() => {
        const sizeKB = Math.round(sizeBytes / 1024);
        const newDoc: SchoolDocument = {
          id: `doc-${Date.now()}`,
          title,
          fileName,
          fileSize: `${sizeKB} KB`,
          department: dept,
          isExtractedForAi: true,
          textContent: `Content extracted from ${fileName}. This document was indexed successfully for school administration. File metadata: title=${title}, size=${sizeKB}KB, department=${dept}.`,
          uploadedAt: new Date().toISOString(),
          fileUrl
        };
        setDocuments((prev) => [...prev, newDoc]);
        resolve(newDoc.id);
      }, 1000);
    });
  };

  // UC05: Edit Document Metadata
  const updateDocumentMetadata = (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: newTitle } : d))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // UC08: Create Event & UC13: Check Schedule Conflict (Timezone-safe)
  const addEvent = (
    title: string,
    location: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    description?: string
  ) => {
    // 1. Timezone-safe Conflict Check (Raw String comparison / minutes comparison)
    // Map existing events in the SAME location on the SAME day
    const hasOverlap = events.some((evt) => {
      if (evt.location.toLowerCase() !== location.toLowerCase()) return false;
      if (evt.startDate !== startDate && evt.endDate !== startDate) return false;
      
      // Calculate minutes from start of day to compare overlap
      const parseTimeToMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const existingStart = parseTimeToMinutes(evt.startTime);
      const existingEnd = parseTimeToMinutes(evt.endTime);
      const newStart = parseTimeToMinutes(startTime);
      const newEnd = parseTimeToMinutes(endTime);

      // Overlap condition: startA < endB && endA > startB
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return {
        success: false,
        error: `Scheduling conflict: ${location} is already booked during this time`
      };
    }

    const newEvt: CalendarEvent = {
      id: `event-${Date.now()}`,
      title,
      location,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      timezone: "+08:00"
    };

    setEvents((prev) => [...prev, newEvt]);
    return { success: true };
  };

  // UC12: Delete Event
  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  // UC08: Update Event with conflict-overlap check
  const updateEvent = (
    id: string,
    title: string,
    location: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    description?: string
  ) => {
    const hasOverlap = events.some((evt) => {
      if (evt.id === id) return false;
      if (evt.location.toLowerCase() !== location.toLowerCase()) return false;
      if (evt.startDate !== startDate && evt.endDate !== startDate) return false;

      const parseTimeToMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      const existingStart = parseTimeToMinutes(evt.startTime);
      const existingEnd = parseTimeToMinutes(evt.endTime);
      const newStart = parseTimeToMinutes(startTime);
      const newEnd = parseTimeToMinutes(endTime);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return {
        success: false,
        error: `Scheduling conflict: ${location} is already booked during this time`
      };
    }

    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id
          ? { ...evt, title, location, startDate, startTime, endDate, endTime, description }
          : evt
      )
    );
    return { success: true };
  };

  // UC09: Import Event
  const importEventsCSV = (fileName: string) => {
    // Inject 3 mock CSV-imported events
    const imported: CalendarEvent[] = [
      {
        id: `evt-csv-1-${Date.now()}`,
        title: "Cocurricular Carnival",
        location: "Main Hall",
        startDate: "2026-07-02",
        startTime: "09:00",
        endDate: "2026-07-02",
        endTime: "16:00",
        timezone: "+08:00"
      },
      {
        id: `evt-csv-2-${Date.now()}`,
        title: "English Speaking Week",
        location: "Auditorium",
        startDate: "2026-07-05",
        startTime: "08:30",
        endDate: "2026-07-09",
        endTime: "13:00",
        timezone: "+08:00"
      },
      {
        id: `evt-csv-3-${Date.now()}`,
        title: "Parents Briefing Session",
        location: "Meeting Room A",
        startDate: "2026-07-12",
        startTime: "14:00",
        endDate: "2026-07-12",
        endTime: "16:30",
        timezone: "+08:00"
      }
    ];

    setEvents((prev) => [...prev, ...imported]);
  };

  // UC10: Manage News (Archive/Delete Memo)
  const deleteMemo = (id: string) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: true } : m))
    );
  };

  // UC10: Add Memo
  const addMemo = (title: string, content: string) => {
    const newMemo: SchoolMemo = {
      id: `memo-${Date.now()}`,
      title,
      content,
      date: new Date().toLocaleDateString("en-CA"),
      isArchived: false
    };
    setMemos((prev) => [newMemo, ...prev]);
  };

  // UC10: Update Memo
  const updateMemo = (id: string, title: string, content: string) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title, content } : m))
    );
  };

  // UC17: Submit Cocurricular Achievements
  const submitAchievement = (title: string, category: string, fileName: string) => {
    const student = users.find((u) => u.role === "student") || defaultUsers[2];
    const newSubmission: AchievementSubmission = {
      id: `achievement-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      title,
      category,
      evidenceName: fileName,
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    setAchievements((prev) => [newSubmission, ...prev]);
  };

  // UC18: Review Achievement Applications
  const reviewAchievement = (id: string, status: "approved" | "rejected", reason?: string) => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, rejectionReason: reason } : a
      )
    );
  };

  // UC19: Manage Registered Cocurricular Groups
  const addCocurricularGroup = (name: string, type: "club" | "sports" | "uniform") => {
    const newGroup: CocurricularGroup = {
      id: `group-${Date.now()}`,
      name,
      type,
      studentIds: []
    };
    setCocurricularGroups((prev) => [...prev, newGroup]);
  };

  const updateCocurricularGroup = (id: string, name: string, type: "club" | "sports" | "uniform") => {
    setCocurricularGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return { ...g, name, type };
        }
        return g;
      })
    );
  };

  const deleteCocurricularGroup = (id: string) => {
    setCocurricularGroups((prev) => {
      const groupToDelete = prev.find((g) => g.id === id);
      if (groupToDelete) {
        setStudentGroups((prevGroups) => {
          const updated = { ...prevGroups };
          groupToDelete.studentIds.forEach((sid) => {
            if (updated[sid]) {
              updated[sid] = updated[sid].filter((gName) => gName !== groupToDelete.name);
            }
          });
          return updated;
        });
      }
      return prev.filter((g) => g.id !== id);
    });
  };

  const addStudentToCocurricularGroup = (groupId: string, studentId: string) => {
    let groupName = "";
    setCocurricularGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          groupName = g.name;
          if (!g.studentIds.includes(studentId)) {
            return { ...g, studentIds: [...g.studentIds, studentId] };
          }
        }
        return g;
      })
    );

    if (groupName) {
      setStudentGroups((prev) => {
        const current = prev[studentId] || [];
        if (current.includes(groupName)) return prev;
        return {
          ...prev,
          [studentId]: [...current, groupName]
        };
      });
    }
  };

  const removeStudentFromCocurricularGroup = (groupId: string, studentId: string) => {
    let groupName = "";
    setCocurricularGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          groupName = g.name;
          return { ...g, studentIds: g.studentIds.filter((sid) => sid !== studentId) };
        }
        return g;
      })
    );

    if (groupName) {
      setStudentGroups((prev) => {
        const current = prev[studentId] || [];
        return {
          ...prev,
          [studentId]: current.filter((gName) => gName !== groupName)
        };
      });
    }
  };

  const updateUserProfile = (id: string, name: string, email: string, phone: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, name, email, phone } : u))
    );
  };

  const addStudentToGroup = (studentId: string, groupName: string) => {
    setStudentGroups((prev) => {
      const current = prev[studentId] || [];
      if (current.includes(groupName)) return prev;
      return {
        ...prev,
        [studentId]: [...current, groupName]
      };
    });

    setCocurricularGroups((prev) =>
      prev.map((g) => {
        if (g.name.toLowerCase() === groupName.toLowerCase()) {
          if (!g.studentIds.includes(studentId)) {
            return { ...g, studentIds: [...g.studentIds, studentId] };
          }
        }
        return g;
      })
    );
  };

  // UC15: Query AI Assistant (Keyword lookup in default documents)
  const sendChatMessage = (text: string) => {
    const query = text.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Compute AI response
    setTimeout(() => {
      let aiText = "";
      let referenceDoc = undefined;

      if (query.includes("deadline") && query.includes("pibg")) {
        aiText = "According to the PIBG guidelines, the deadline for the PIBG payment is **15th July 2026**. Late payments require approval from the Head of Department. The annual meeting will take place in the PIBG Room on 1st July.";
        referenceDoc = "pibg_guidelines_2026.pdf";
      } else if (query.includes("sports day") || query.includes("takwim")) {
        aiText = "Based on the school calendar (Takwim) documents, **Sports Day** is scheduled for **10th July 2026** at the School Field, running from 08:00 AM to 02:00 PM.";
        referenceDoc = "pibg_guidelines_2026.pdf";
      } else if (query.includes("cocurricular") && (query.includes("deadline") || query.includes("achievement"))) {
        aiText = "The student conduct policy states that the deadline for submitting any cocurricular achievement proof is **2 weeks after the event**. All certificates must be signed by the main club teacher.";
        referenceDoc = "student_conduct_policy.pdf";
      } else if (query.includes("meeting") && query.includes("venue")) {
        aiText = "The venue for the PIBG Annual Meeting is the **PIBG Room**. It will start at 09:00 AM on 1st July 2026.";
        referenceDoc = "pibg_guidelines_2026.pdf";
      } else {
        // Out of scope check
        const schoolKeywords = [
          "sriaawp", "pibg", "sports", "school", "cocurricular", "uniform", 
          "event", "calendar", "takwim", "fee", "conduct", "policy", "club",
          "meeting", "teacher", "student", "memo", "achievement"
        ];
        
        const isSchoolRelated = schoolKeywords.some(keyword => query.includes(keyword));
        
        if (isSchoolRelated) {
          aiText = "I found school records regarding your query, but no specific detail matches. Please ensure you check the uploaded documents under the Department Management console, or contact your class teacher.";
        } else {
          aiText = "I apologize, but I can only answer questions related to SRIAAWP guidelines. This request is out of scope.";
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp,
        referenceDoc
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <PortalContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        users,
        updateUserRole,
        deleteUser,
        departments,
        addDepartment,
        deleteDepartment,
        documents,
        uploadDocument,
        updateDocumentMetadata,
        deleteDocument,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        importEventsCSV,
        memos,
        addMemo,
        updateMemo,
        deleteMemo,
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
        updateUserProfile,
        addStudentToGroup,
        chatMessages,
        sendChatMessage,
        resetAllState,
        registerUser,
        verifyUser
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};
