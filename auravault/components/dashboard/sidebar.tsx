"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Lock,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "advisor", label: "AI Advisor", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {!mobileOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-3 left-4 z-[60] bg-sidebar border-sidebar-border shadow-md"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] md:relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-20 w-64" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between gap-3 border-b border-sidebar-border h-16 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center shrink-0 text-emerald-500">
              <Hexagon className="w-10 h-10" strokeWidth={2.5} />
              <Lock className="w-4 h-4 absolute" strokeWidth={2.5} />
            </div>

            {(!collapsed || mobileOpen) && (
              <span className="text-2xl font-extrabold text-sidebar-foreground tracking-tighter">
                Aura<span className="text-emerald-500">Vault</span>
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-sidebar-accent text-emerald-500"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(!collapsed || mobileOpen) && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}