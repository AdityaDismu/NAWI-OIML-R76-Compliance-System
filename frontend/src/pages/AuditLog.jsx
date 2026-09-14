import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import { getAuditLogs } from "../api/audit";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    getAuditLogs().then((data) => setLogs(data.items || [])).catch((error) => console.error("Audit load failed:", error));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Track evaluation and testing activity." />
      <Card className="overflow-hidden">
        {logs.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No audit events found.</div> : logs.map((log) => (
          <div key={log.id} className="border-b border-slate-800 p-4 last:border-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-white">{log.action || "EVENT"}</span>
              <span className="text-xs text-slate-500">{log.created_at || ""}</span>
            </div>
            {log.evaluation_id && <p className="mt-1 text-xs text-slate-500">Evaluation: {log.evaluation_id}</p>}
          </div>
        ))}
      </Card>
    </div>
  );
}
