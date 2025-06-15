
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataUploadTab } from "./DataUploadTab";
import { QueryTab } from "./QueryTab";
import { VectorStoreTab } from "./VectorStoreTab";
import { SettingsTab } from "./SettingsTab";

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface RAGSystemDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RAGSystemDashboard = ({ activeTab: externalActiveTab, onTabChange }: RAGSystemDashboardProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState("upload");
  const [uploadedData, setUploadedData] = useState<MimicRecord[]>([]);

  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab: string) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="flex-1 p-6">
      {/* Enhanced Header Section with UAMS Logo */}
      <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-8 border border-red-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src="/lovable-uploads/e4cb6e4d-fe11-48fa-b2a0-5fac96251bb3.png" 
              alt="UAMS Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Local RAG System for MIMIC IV Data
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              University of Arkansas for Medical Sciences
            </p>
            <p className="text-gray-600">
              Build and query your local RAG system with clinical discharge notes while maintaining HIPAA compliance
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Data Upload</TabsTrigger>
          <TabsTrigger value="query">Query System</TabsTrigger>
          <TabsTrigger value="vector">Vector Store</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <DataUploadTab onDataUploaded={setUploadedData} />
        </TabsContent>

        <TabsContent value="query" className="mt-6">
          <QueryTab uploadedData={uploadedData} />
        </TabsContent>

        <TabsContent value="vector" className="mt-6">
          <VectorStoreTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
