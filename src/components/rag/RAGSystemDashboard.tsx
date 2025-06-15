
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
      {/* Professional Header Section with Enhanced UAMS Logo */}
      <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-1">
          <div className="bg-white rounded-lg">
            <div className="flex flex-col lg:flex-row items-center gap-8 p-8">
              <div className="flex-shrink-0">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <img 
                    src="/lovable-uploads/e4cb6e4d-fe11-48fa-b2a0-5fac96251bb3.png" 
                    alt="UAMS Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="text-center flex-1">
                <div className="mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    Local RAG System for MIMIC IV Data
                  </h1>
                </div>
                <div className="mb-3">
                  <p className="text-xl font-semibold text-red-700">
                    University of Arkansas for Medical Sciences
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <p className="text-gray-600 leading-relaxed">
                    Build and query your local RAG system with clinical discharge notes while maintaining HIPAA compliance and ensuring data privacy
                  </p>
                </div>
              </div>
            </div>
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
