"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";

const formatMessage = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const DEFAULT_MESSAGE = [{ role: "ai", content: "Hello! I am your AuraVault AI. Tell me what you want?" }];

export function ChatWidget() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(DEFAULT_MESSAGE);
  const widgetSessionIdRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const saveAndBroadcast = (newMessages: { role: string; content: string }[]) => {
    setMessages(newMessages);
    localStorage.setItem("auraVault_aiHistory", JSON.stringify(newMessages));

    let currentId = widgetSessionIdRef.current;
    if (!currentId) {
      currentId = Date.now().toString();
      widgetSessionIdRef.current = currentId;
    }

    const savedChatsStr = localStorage.getItem("auraVault_aiChats");
    let chats = savedChatsStr ? JSON.parse(savedChatsStr) : [];

    let title = "New Chat";
    if (newMessages.length > 1) {
      const firstUser = newMessages.find((m: any) => m.role === "user");
      if (firstUser) title = firstUser.content.substring(0, 20) + (firstUser.content.length > 20 ? "..." : "");
    }

    const existingIndex = chats.findIndex((c: any) => c.id === currentId);
    if (existingIndex >= 0) {
      chats[existingIndex].messages = newMessages;
      chats[existingIndex].title = title;
      chats[existingIndex].updatedAt = Date.now();
    } else {
      chats.unshift({
        id: currentId,
        title: title,
        messages: newMessages,
        updatedAt: Date.now()
      });
    }

    localStorage.setItem("auraVault_aiChats", JSON.stringify(chats));
    window.dispatchEvent(new Event("aiHistoryUpdated"));
  };

  const closeWidget = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages(DEFAULT_MESSAGE);
      widgetSessionIdRef.current = null;
    }, 300);
  };

  const handleClearChat = () => {
    setMessages(DEFAULT_MESSAGE);
    widgetSessionIdRef.current = null;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isOpen) {
        if (
          chatWindowRef.current &&
          !chatWindowRef.current.contains(target) &&
          toggleButtonRef.current &&
          !toggleButtonRef.current.contains(target)
        ) {
          closeWidget();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isLoaded || !user?.id) return;

    const userText = input;
    setInput("");

    const userUpdatedMessages = [...messages, { role: "user", content: userText }];
    saveAndBroadcast(userUpdatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          userId: user.id,
          history: messages.length > 1 ? messages.slice(1) : []
        }),
      });

      const data = await response.json();

      saveAndBroadcast([
        ...userUpdatedMessages,
        { role: "ai", content: data.reply || "I didn't quite catch that." },
      ]);
    } catch (error) {
      saveAndBroadcast([
        ...userUpdatedMessages,
        { role: "ai", content: "System error: Could not connect to AuraVault servers." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <span className="absolute inset-0 w-full h-full rounded-full bg-emerald-500 opacity-40 animate-ping shadow-lg"></span>
        )}
        <button
          ref={toggleButtonRef}
          onClick={() => isOpen ? closeWidget() : setIsOpen(true)}
          className="relative p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center z-10"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-sidebar border border-sidebar-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5"
        >
          <div className="p-4 bg-sidebar-accent border-b border-sidebar-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">AuraVault AI</h3>
                <p className="text-xs text-emerald-500">Online & Secure</p>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-sidebar-border"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 border border-sidebar-border">
                    <Bot className="w-4 h-4 text-emerald-500" />
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-black rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-sidebar-border"
                  }`}
                >
                  {msg.role === "ai" ? formatMessage(msg.content) : msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 border border-sidebar-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 border border-sidebar-border">
                  <Bot className="w-4 h-4 text-emerald-500 animate-pulse" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-muted text-muted-foreground rounded-bl-sm border border-sidebar-border flex gap-1 items-center h-[36px]">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-sidebar-border bg-sidebar-accent/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-background border border-sidebar-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !isLoaded || !user?.id}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}