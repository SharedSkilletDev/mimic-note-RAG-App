
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RAGSystemDashboard } from "@/components/rag/RAGSystemDashboard";
import { AppSidebar } from "@/components/rag/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserMenu } from "@/components/rag/UserMenu";

const Index = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full">
            <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <SidebarInset className="flex-1">
              <div className="flex justify-between items-center p-4 border-b">
                <SidebarTrigger />
                <UserMenu />
              </div>
              <RAGSystemDashboard activeTab={activeTab} onTabChange={setActiveTab} />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
