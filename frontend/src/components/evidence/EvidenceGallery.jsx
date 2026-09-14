import { Files } from "lucide-react";
import Card from "../ui/Card";
import EvidenceItem from "./EvidenceItem";

export default function EvidenceGallery({
  attachments = [],
  onDelete,
}) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Evidence Repository
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Supporting files attached to this evaluation.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10">
          <Files className="h-5 w-5 text-cyan-400" />
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center">
          <Files className="mx-auto h-8 w-8 text-slate-600" />

          <p className="mt-3 text-sm text-slate-400">
            No evidence uploaded yet.
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Upload photographs, certificates or supporting documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {attachments.map((attachment) => (
            <EvidenceItem
              key={attachment.id}
              attachment={attachment}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}