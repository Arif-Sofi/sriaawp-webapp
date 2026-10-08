"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePortal } from "../(portal)/context/PortalContext";

export default function AIAssistantDrawer() {
  const { chatMessages, sendChatMessage } = usePortal();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    sendChatMessage(inputValue);
    setInputValue("");
  };

  const selectSuggestion = (text: string) => {
    sendChatMessage(text);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);

  const suggestions = [
    "When is the deadline for PIBG payment?",
    "When is Sports Day and where is it?",
    "What is the deadline for submitting cocurricular proof?",
    "What is the capital of Malaysia?"
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-linear-to-tr from-primary to-cta text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/20"
        title="Query AI Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></span>
          </div>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] transition-opacity duration-300"
        />
      )}

      {/* Chat Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white/95 backdrop-blur-md shadow-2xl z-45 border-l border-secondary/10 flex flex-col transition-all duration-500 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-secondary to-primary text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-yellow-300 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.482-3.482L9.813 15.904z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L5.53 11.621M3 21l3.582-3.582" />
              </svg>
            </div> */}
            <div>
              <h3 className="font-bold text-lg leading-tight">Agentic AI Assistant</h3>
              <p className="text-white/70 text-xs font-semibold">SRIAAWP Portal Context Agent</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white border border-secondary/10 text-slate-800 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 font-semibold px-1">
                <span>{msg.timestamp}</span>
                {msg.referenceDoc && (
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ref: {msg.referenceDoc}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {chatMessages.length <= 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-secondary/5">
            <p className="text-xs text-gray-500 font-bold mb-2">Frequently Asked Queries:</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(s)}
                  className="text-left text-xs bg-white border border-secondary/15 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm font-semibold"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-secondary/10 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Query guidelines, takwim, deadlines..."
            className="flex-1 bg-slate-100 border border-secondary/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-slate-800 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white p-3 rounded-xl shadow hover:scale-105 active:scale-95 transition-all cursor-pointer border border-secondary"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
