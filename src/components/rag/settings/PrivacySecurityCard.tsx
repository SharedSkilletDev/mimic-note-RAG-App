
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

interface PrivacySecurityCardProps {
  enableLogging: boolean;
  enableCache: boolean;
  onEnableLoggingChange: (enabled: boolean) => void;
  onEnableCacheChange: (enabled: boolean) => void;
}

export const PrivacySecurityCard = ({
  enableLogging,
  enableCache,
  onEnableLoggingChange,
  onEnableCacheChange
}: PrivacySecurityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Security
        </CardTitle>
        <CardDescription>
          HIPAA compliance and data security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Logging</p>
              <p className="text-sm text-muted-foreground">Log system activities for debugging</p>
            </div>
            <Switch
              checked={enableLogging}
              onCheckedChange={onEnableLoggingChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Caching</p>
              <p className="text-sm text-muted-foreground">Cache embeddings and results locally</p>
            </div>
            <Switch
              checked={enableCache}
              onCheckedChange={onEnableCacheChange}
            />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">HIPAA Compliance Features</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• All data processing happens locally on your device</li>
            <li>• No data is sent to external APIs or services</li>
            <li>• Vector embeddings are stored locally</li>
            <li>• Full audit trail of data access (when logging enabled)</li>
            <li>• Secure local storage with encryption at rest</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
