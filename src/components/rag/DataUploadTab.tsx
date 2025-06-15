import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface DataUploadTabProps {
  onDataUploaded: (data: MimicRecord[]) => void;
}

export const DataUploadTab = ({ onDataUploaded }: DataUploadTabProps) => {
  const [uploadedData, setUploadedData] = useState<MimicRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const data: MimicRecord[] = JSON.parse(text);
      
      // Validate data structure
      if (!Array.isArray(data) || !data.every(record => 
        record.note_id && record.subject_id && record.cleaned_text
      )) {
        throw new Error("Invalid data format");
      }

      setUploadedData(data);
      onDataUploaded(data);
      toast({
        title: "Data uploaded successfully",
        description: `Loaded ${data.length} clinical records`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please ensure your JSON file contains valid MIMIC IV data",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleData: MimicRecord = {
    note_id: "12103604-DS-13",
    subject_id: 12103604,
    hadm_id: 22966614,
    charttime: "2183-04-05",
    cleaned_text: "Sex: M\n\nService: MEDICINE\n\nAllergies: No Known Allergies / Adverse Drug Reactions\n\nChief Complaint: Chest pain with exertion\n\nMajor Surgical or Invasive Procedure: Cardiac Catheterization..."
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload MIMIC IV Data
          </CardTitle>
          <CardDescription>
            Upload your JSON file containing MIMIC IV discharge notes for local processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Click to upload JSON file</p>
              <p className="text-sm text-muted-foreground">
                Select your MIMIC IV discharge notes JSON file
              </p>
            </label>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Processing data...</span>
            </div>
          )}

          {uploadedData.length > 0 && (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">
                Successfully loaded {uploadedData.length} records
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Data Format</CardTitle>
          <CardDescription>
            Your JSON file should contain an array of objects with the following structure:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{JSON.stringify(sampleData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Local Processing Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>HIPAA compliant - data never leaves your device</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Cost-effective - no API fees for embeddings or LLM calls</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Full control over your clinical data</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Works offline after initial setup</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
