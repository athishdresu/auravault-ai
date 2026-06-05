"use client";

import { useState } from "react";
import { DashboardView } from "@/components/DashboardView";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AdvisorView } from "@/components/AdvisorView";
import { TransactionsView } from "@/components/TransactionsView";
import { SettingsPage } from "@/components/dashboard/settings-page";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* LEFT SIDE: Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* RIGHT SIDE: Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          
          {/* TAB 1: Live AWS Dashboard */}
          {activeTab === "dashboard" && <DashboardView />}

          {/* TAB 2: Live AWS Transactions */}
          {activeTab === "transactions" && <TransactionsView />}

          {/* TAB 3: Settings */}
          {activeTab === "settings" && <SettingsPage />}

          {/* TAB 4: AI Advisor */}
          {activeTab === "advisor" && <AdvisorView />}

        </main>
      </div>
    </div>
  );
}