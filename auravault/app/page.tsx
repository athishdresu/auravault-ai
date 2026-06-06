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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentTab={activeTab} />
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "settings" && <SettingsPage />}
          {activeTab === "advisor" && <AdvisorView />}
        </main>
      </div>
    </div>
  );
}