"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiUrl } from "@/lib/config";
import { useState } from "react";

export default function DebugEnvPage() {
  const [testResult, setTestResult] = useState<string>("");

  const testConnection = async () => {
    try {
      const apiUrl = getApiUrl('health');
      console.log('Testing connection to:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      setTestResult(`✅ Success! Status: ${response.status}, Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variable Debug</CardTitle>
          <CardDescription>
            Check if the environment variable is being read correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">Environment Variables</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>NEXT_PUBLIC_API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}</p>
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Generated API URL</h3>
            <p className="text-sm mt-1">Health endpoint: {getApiUrl('health')}</p>
            <p className="text-sm">Login endpoint: {getApiUrl('api/admin/login')}</p>
          </div>

          <button 
            onClick={testConnection}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Test Backend Connection
          </button>

          {testResult && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold">Test Result:</h3>
              <pre className="text-sm mt-2 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 