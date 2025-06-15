
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileCheck, Eye, Database, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const HIPAAComplianceTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            HIPAA Compliance Overview
          </CardTitle>
          <CardDescription>
            This Local RAG System is designed with HIPAA compliance at its core
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Lock className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Local Processing</h4>
                <p className="text-sm text-green-700">All data stays on your device</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Secure Storage</h4>
                <p className="text-sm text-blue-700">Encrypted vector embeddings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Eye className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-purple-800">Audit Trail</h4>
                <p className="text-sm text-purple-700">Complete access logging</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            HIPAA Safeguards Implementation
          </CardTitle>
          <CardDescription>
            How this system meets HIPAA Administrative, Physical, and Technical Safeguards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">Administrative</Badge>
              Administrative Safeguards
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Access Control:</strong> User authentication required for system access</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Training:</strong> Users must be trained on HIPAA compliance requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Audit Controls:</strong> System logs all data access and processing activities</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50">Physical</Badge>
              Physical Safeguards
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Local Installation:</strong> System runs entirely on local hardware</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Device Controls:</strong> Access restricted to authorized workstations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Media Controls:</strong> Secure handling of storage media containing PHI</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">Technical</Badge>
              Technical Safeguards
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Access Control:</strong> Unique user identification and authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Audit Controls:</strong> Hardware, software, and procedural mechanisms for audit logs</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Integrity:</strong> PHI is not improperly altered or destroyed</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Transmission Security:</strong> No external data transmission - all local</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Assessment & Mitigation
          </CardTitle>
          <CardDescription>
            Identified risks and how this system addresses them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <h5 className="font-semibold text-green-800">✓ Data Breach Prevention</h5>
              <p className="text-sm text-green-700 mt-1">
                <strong>Risk:</strong> Unauthorized access to PHI<br/>
                <strong>Mitigation:</strong> All data processing happens locally with no external API calls or data transmission
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <h5 className="font-semibold text-green-800">✓ Unauthorized Access</h5>
              <p className="text-sm text-green-700 mt-1">
                <strong>Risk:</strong> Unauthorized users accessing the system<br/>
                <strong>Mitigation:</strong> Authentication required, access controls implemented
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <h5 className="font-semibold text-green-800">✓ Data Loss</h5>
              <p className="text-sm text-green-700 mt-1">
                <strong>Risk:</strong> Accidental deletion or corruption of PHI<br/>
                <strong>Mitigation:</strong> Local backup capabilities, data integrity checks
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <h5 className="font-semibold text-green-800">✓ Third-Party Exposure</h5>
              <p className="text-sm text-green-700 mt-1">
                <strong>Risk:</strong> PHI exposure through third-party services<br/>
                <strong>Mitigation:</strong> Zero external dependencies - everything runs locally using Ollama
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Checklist</CardTitle>
          <CardDescription>
            Ensure your organization meets these requirements when using this system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-semibold">Technical Requirements</h5>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Secure workstation with encrypted storage</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Updated antivirus and security software</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Network security measures in place</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Regular security updates applied</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold">Administrative Requirements</h5>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>HIPAA training completed by all users</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Business Associate Agreements in place</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Risk assessment documented</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Incident response plan established</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
