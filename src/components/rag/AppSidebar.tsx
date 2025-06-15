
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Search, Database, Settings, Shield } from "lucide-react";

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const menuItems = [
    {
      title: "Data Upload",
      icon: FileText,
      value: "upload"
    },
    {
      title: "Query System",
      icon: Search,
      value: "query"
    },
    {
      title: "Vector Store",
      icon: Database,
      value: "vector"
    },
    {
      title: "HIPAA Compliance",
      icon: Shield,
      value: "hipaa"
    },
    {
      title: "Settings",
      icon: Settings,
      value: "settings"
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/lovable-uploads/3b8bb483-efde-4e04-8a0b-fb5f8cc25638.png" 
            alt="UAMS Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Local RAG System</h2>
            <p className="text-sm text-muted-foreground">MIMIC IV Clinical Data</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.value}>
              <SidebarMenuButton 
                onClick={() => onTabChange?.(item.value)}
                isActive={activeTab === item.value}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
