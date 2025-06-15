
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

export const RAGSystemDashboard = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedData, setUploadedData] = useState<MimicRecord[]>([]);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Local RAG System for MIMIC IV Data</h1>
        <p className="text-muted-foreground mt-2">
          Build and query your local RAG system with clinical discharge notes while maintaining HIPAA compliance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
