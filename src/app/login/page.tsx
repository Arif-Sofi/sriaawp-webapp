"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import schoolBg from "@/images/school_bg.png";
import schoolLogo from "@/images/logo.png";

type RoleType = "admin" | "teacher" | "student" | "parent" | "public";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  linkedStudentId?: string;
  isVerified?: boolean;
}

const defaultUsers: UserProfile[] = [
  { id: "admin-uuid-333", name: "HOD Sarah", email: "admin@email.com", phone: "0198765432", role: "admin", isVerified: true },
  { id: "teacher-uuid-222", name: "Arif Sofi", email: "teacher@school.edu", phone: "0112233445", role: "teacher", isVerified: true },
  { id: "student-uuid-111", name: "Ali bin Abu", email: "newtest@gmail.com", phone: "0123456789", role: "student", isVerified: true },
  { id: "parent-uuid-444", name: "Ahmad (Parent of Ali)", email: "parent@email.com", phone: "0176543210", role: "parent", linkedStudentId: "student-uuid-111", isVerified: true }
];

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"login" | "register" | "forgot" | "reset">("login");
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<RoleType>("student");
  const [regPassword, setRegPassword] = useState("");
  
  // Verification / Error State
  const [pendingVerificationUser, setPendingVerificationUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pendingResetUser, setPendingResetUser] = useState<UserProfile | null>(null);
  const [showForgotVerify, setShowForgotVerify] = useState(false);

  // Helper to load users list from localStorage
  const getStoredUsers = (): UserProfile[] => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sriaawp_users");
      if (stored) return JSON.parse(stored);
    }
    return defaultUsers;
  };

  // Helper to save users list to localStorage
  const saveStoredUsers = (usersList: UserProfile[]) => {
    localStorage.setItem("sriaawp_users", JSON.stringify(usersList));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      const usersList = getStoredUsers();
      const matched = usersList.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (matched) {
        if (matched.isVerified === false) {
          setError("Account requires verification. Check verification email link.");
          setPendingVerificationUser(matched);
          return;
        }
        localStorage.setItem("sriaawp_role", matched.role);
        // Redirect to worksheet page or portal
        router.push("/");
      } else {
        setError("Invalid email or password");
      }
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill in required fields.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const usersList = getStoredUsers();
      
      // Check if email already exists
      const exists = usersList.some(
        (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );
      if (exists) {
        setError("Email already registered.");
        return;
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        role: regRole,
        isVerified: false,
        linkedStudentId: regRole === "parent" ? "student-uuid-111" : undefined
      };

      const updatedList = [...usersList, newUser];
      saveStoredUsers(updatedList);
      setPendingVerificationUser(newUser);
    }, 1000);
  };

  const handleVerifyLinkClick = () => {
    if (!pendingVerificationUser) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const usersList = getStoredUsers();
      const updatedList = usersList.map((u) =>
        u.id === pendingVerificationUser.id ? { ...u, isVerified: true } : u
      );
      
      saveStoredUsers(updatedList);
      localStorage.setItem("sriaawp_role", pendingVerificationUser.role);
      
      setPendingVerificationUser(null);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      
      router.push("/");
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resetEmail.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const usersList = getStoredUsers();
      const matched = usersList.find(
        (u) => u.email.toLowerCase() === resetEmail.trim().toLowerCase()
      );

      if (matched) {
        setPendingResetUser(matched);
        setShowForgotVerify(true);
      } else {
        setError("Email address not found.");
      }
    }, 1000);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      const usersList = getStoredUsers();
      const updatedList = usersList.map((u) =>
        u.id === pendingResetUser?.id ? { ...u, isVerified: true } : u
      );
      saveStoredUsers(updatedList);

      setAuthTab("login");
      setLoginEmail(resetEmail);
      setLoginPassword(newPassword);
      alert("Password updated successfully! Please sign in with your new password.");

      setResetEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPendingResetUser(null);
      setShowForgotVerify(false);
    }, 1000);
  };

  const selectShortcutAccount = (emailVal: string) => {
    setError("");
    setLoginEmail(emailVal);
    setLoginPassword("password"); // Default mock password
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center font-montserrat">
      {/* 1. Background Image using next/image fill */}
      <Image
        src={schoolBg}
        alt="School Background"
        fill
        className="object-cover pointer-events-none"
        priority
      />

      {/* 2. 50% opacity dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* 3. Center Login Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 md:px-10 md:py-5 bg-white/95 backdrop-blur-md rounded-3xl border-3 border-secondary shadow-2xl flex flex-col items-center">
        <a href="/" className="w-full text-2xl"> ← </a>
        {/* Playful School Icon Header */}
        <div className="mb-2 rounded-full border-2 border-blue-950 ">
          <a href="/">
            <Image src={schoolLogo} alt="School Logo" className="w-40 h-40 "/>
          </a>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 mb-1">
          SRIAAWP Portal
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          School Management and Communication System
        </p>

        {pendingVerificationUser ? (
          /* UC03: VERIFICATION LINK SIMULATION */
          <div className="w-full bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center">
            {/* <span className="text-4xl animate-bounce">✉️</span> */}
            <h4 className="font-bold text-sm text-amber-800">Verification Link Sent</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              A verification email has been simulated for <span className="font-bold">{pendingVerificationUser.email}</span>. Click the link below to verify registration status.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={handleVerifyLinkClick}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs shadow-md border border-amber-800 transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Verify Registration Link"}
            </button>
          </div>
        ) : (
          <>
            {/* Role Switcher Tabs */}
            {(authTab === "login" || authTab === "register") && (
              <div className="w-full grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border-2 border-secondary/15">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("login");
                    setError("");
                  }}
                  className={`py-2 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    authTab === "login"
                      ? "bg-primary text-white shadow-md scale-102"
                      : "text-gray-500 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("register");
                    setError("");
                  }}
                  className={`py-2 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    authTab === "register"
                      ? "bg-primary text-white shadow-md scale-102"
                      : "text-gray-500 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full mb-4 px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-bounce">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            {authTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
                {/* Shortcut account quick-picker */}
                {/* <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                    Demo Shortcut Accounts
                  </label>
                  <select
                    onChange={(e) => selectShortcutAccount(e.target.value)}
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  >
                    <option value="">-- Prefill Account --</option>
                    <option value="student@school.edu">Ali bin Abu (Student)</option>
                    <option value="parent@email.com">Abu bin Ahmad (Parent)</option>
                    <option value="teacher@school.edu">Arif Sofi (Teacher)</option>
                    <option value="admin@email.com">Sarah (Admin)</option>
                  </select>
                </div> */}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. parent@email.com"
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium placeholder-gray-400 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium placeholder-gray-400 text-slate-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-primary border-2 border-secondary text-white font-bold py-3.5 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("forgot");
                    setError("");
                    setResetEmail("");
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 text-left pl-1 cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </form>
            )}

            {authTab === "register" && (
              /* Registration Form */
              <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ali bin Abu"
                      className="w-full bg-white border-2 border-secondary/20 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs text-slate-950 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 ml-1">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="test@email.com"
                      className="w-full bg-white border-2 border-secondary/20 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs text-slate-950 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 ml-1">Phone</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0123456789"
                      className="w-full bg-white border-2 border-secondary/20 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs text-slate-950 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 ml-1">Role Type</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as RoleType)}
                      className="w-full bg-white border-2 border-secondary/20 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 ml-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs text-slate-950 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-primary border-2 border-secondary text-white font-bold py-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {loading ? "Registering..." : "Register Account"}
                </button>
              </form>
            )}

            {authTab === "forgot" && (
              /* Forgot Password Request Form */
              showForgotVerify ? (
                /* UC02: SIMULATED PASSWORD RESET LINK CLICK */
                <div className="w-full bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center animate-fadeIn">
                  <span className="text-4xl animate-bounce">🔑</span>
                  <h4 className="font-bold text-sm text-amber-800">Reset Link Sent</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    A password reset link was simulated for <span className="font-bold">{pendingResetUser?.email}</span>. Click the button below to confirm the request and choose a new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotVerify(false);
                      setAuthTab("reset");
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs shadow-md border border-amber-800 transition-all cursor-pointer flex items-center justify-center"
                  >
                    Simulate Reset Link Click
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="w-full flex flex-col gap-4 animate-fadeIn">
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Reset Password</h4>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                    Enter your registered email address and we'll simulate sending you a password reset link.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. parent@email.com"
                      className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium placeholder-gray-400 text-slate-900 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-primary border-2 border-secondary text-white font-bold py-3.5 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setError("");
                      setResetEmail("");
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-slate-850 mt-1 cursor-pointer transition-colors self-center"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )
            )}

            {authTab === "reset" && (
              /* New Password Form */
              <form onSubmit={handleResetSubmit} className="w-full flex flex-col gap-4 animate-fadeIn">
                <h4 className="font-bold text-sm text-slate-800 mb-1">Create New Password</h4>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  Choose a new secure password for your account <span className="font-bold text-slate-800">({pendingResetUser?.email})</span>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium placeholder-gray-400 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium placeholder-gray-400 text-slate-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-primary border-2 border-secondary text-white font-bold py-3.5 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 font-semibold">
          <p>
            Demo Accounts: Choose shortcut dropdown or type <span className="text-slate-800">parent@email.com / password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
