
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
        <h2 className="text-lg font-semibold">Local RAG System</h2>
        <p className="text-sm text-muted-foreground">MIMIC IV Clinical Data</p>
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
