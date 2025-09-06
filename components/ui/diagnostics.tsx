"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface DiagnosticResult {
  id: string;
  name: string;
  status: "success" | "error" | "warning" | "checking";
  message: string;
  fix?: string;
}

export function Diagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const checks: DiagnosticResult[] = [];

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    checks.push({
      id: "env-url",
      name: "Supabase URL Configuration",
      status: supabaseUrl ? "success" : "error",
      message: supabaseUrl
        ? "✅ NEXT_PUBLIC_SUPABASE_URL is configured"
        : "❌ NEXT_PUBLIC_SUPABASE_URL is missing",
      fix: !supabaseUrl
        ? "Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file"
        : undefined,
    });

    checks.push({
      id: "env-key",
      name: "Supabase API Key Configuration",
      status: supabaseKey ? "success" : "error",
      message: supabaseKey
        ? "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is configured"
        : "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing",
      fix: !supabaseKey
        ? "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file"
        : undefined,
    });

    // Test API connectivity
    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch("/api/polls");
        const data = await response.json();

        checks.push({
          id: "api-connection",
          name: "API Connection Test",
          status: response.ok ? "success" : "error",
          message: response.ok
            ? "✅ API is responding correctly"
            : `❌ API returned ${response.status}: ${data.error || "Unknown error"}`,
          fix: !response.ok
            ? "Check your Supabase project status and database setup"
            : undefined,
        });
      } catch (error) {
        checks.push({
          id: "api-connection",
          name: "API Connection Test",
          status: "error",
          message: `❌ Failed to connect to API: ${
            error instanceof Error ? error.message : "Network error"
          }`,
          fix: "Ensure the development server is running and try again",
        });
      }
    } else {
      checks.push({
        id: "api-connection",
        name: "API Connection Test",
        status: "warning",
        message: "⚠️ Skipped - Environment variables not configured",
        fix: "Configure Supabase environment variables first",
      });
    }

    setResults(checks);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "checking":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const errorCount = results.filter((r) => r.status === "error").length;
  const successCount = results.filter((r) => r.status === "success").length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Diagnostics</span>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Running..." : "Recheck"}
          </Button>
        </CardTitle>
        <CardDescription>
          Verify that your AlX Polly application is properly configured
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-medium">✅ Passed</div>
            <div className="text-green-600 text-sm">{successCount} checks</div>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium">❌ Failed</div>
            <div className="text-red-600 text-sm">{errorCount} checks</div>
          </div>
        </div>

        {/* Overall Status */}
        {errorCount === 0 && results.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                All systems operational!
              </span>
            </div>
            <div className="text-green-700 text-sm mt-1">
              Your application is properly configured and ready to create polls.
            </div>
          </div>
        )}

        {errorCount > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                Configuration issues detected
              </span>
            </div>
            <div className="text-red-700 text-sm mt-1">
              {errorCount} issue{errorCount > 1 ? "s" : ""} must be resolved
              before the application will work properly.
            </div>
          </div>
        )}

        {/* Diagnostic Results */}
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-4 border rounded-lg ${
                result.status === "error"
                  ? "bg-red-50 border-red-200"
                  : result.status === "warning"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {result.name}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {result.message}
                  </div>
                  {result.fix && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="font-medium text-blue-800 mb-1">
                        How to fix:
                      </div>
                      <div className="text-blue-700">{result.fix}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        {errorCount > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-800 mb-2">
              Quick Setup Guide:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>
                Create a{" "}
                <code className="bg-blue-100 px-1 rounded font-mono">
                  .env.local
                </code>{" "}
                file in your project root
              </li>
              <li>
                Add your Supabase URL:{" "}
                <code className="bg-blue-100 px-1 rounded font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                </code>
              </li>
              <li>
                Add your Supabase anon key:{" "}
                <code className="bg-blue-100 px-1 rounded font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                </code>
              </li>
              <li>Restart your development server</li>
              <li>Run the database setup SQL in your Supabase dashboard</li>
            </ol>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
            <div className="text-sm text-gray-600 mt-2">Running diagnostics...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
