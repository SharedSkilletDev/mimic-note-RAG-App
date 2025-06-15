
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RAGSystemDashboard } from "@/components/rag/RAGSystemDashboard";
import { AppSidebar } from "@/components/rag/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserMenu } from "@/components/rag/UserMenu";

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <div className="flex justify-between items-center p-4 border-b">
                <div></div>
                <UserMenu />
              </div>
              <RAGSystemDashboard />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
