import {
  FileText,
  Download,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { getReportDownloadUrl } from "../../api/reports";

export default function ReportHistory({
  reports = [],
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-white">
          Report History
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Previously generated report versions.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-600" />

          <p className="mt-3 text-sm text-slate-400">
            No reports generated yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {reports.map((report, index) => {
            const version =
              report.version ||
              report.report_version ||
              index + 1;

            return (
              <div
                key={report.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                    <FileText className="h-5 w-5 text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Report Version {version}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {report.created_at
                        ? new Date(
                            report.created_at
                          ).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge>
                    {String(
                      report.status || "GENERATED"
                    ).toUpperCase()}
                  </Badge>

                  <a
                    href={getReportDownloadUrl(
                      report.id,
                      "pdf"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}