
import React from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { RAGSystemDashboard } from "@/components/rag/RAGSystemDashboard";
import { AppSidebar } from "@/components/rag/AppSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <RAGSystemDashboard />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
