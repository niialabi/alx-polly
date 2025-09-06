import { Diagnostics } from "@/components/ui/diagnostics";

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">System Diagnostics</h1>
          <p className="text-muted-foreground">
            Use this page to troubleshoot configuration issues and verify that
            your AlX Polly application is set up correctly.
          </p>
        </div>

        <Diagnostics />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues after following the
            troubleshooting steps, please check the{" "}
            <a
              href="https://github.com/your-repo/alx-polly"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>{" "}
            or server logs for more detailed error information.
          </p>
        </div>
      </div>
    </div>
  );
}
