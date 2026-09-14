import { useState } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function EvidenceUploader({
  tests = [],
  onUpload,
  uploading = false,
}) {
  const [file, setFile] = useState(null);
  const [testInstanceId, setTestInstanceId] = useState("");
  const [description, setDescription] = useState("");

  function handleFileChange(event) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setFile(selected);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) return;

    onUpload({
      file,
      testInstanceId: testInstanceId || null,
      description,
    });
  }

  function clearFile() {
    setFile(null);
    setDescription("");
  }

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">
          Upload Evidence
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Attach photographs, certificates, reports or other supporting
          documents to this evaluation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!file ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center transition hover:border-cyan-400/50 hover:bg-slate-900">
            <Upload className="mb-3 h-8 w-8 text-cyan-400" />

            <span className="text-sm font-medium text-slate-200">
              Choose a file
            </span>

            <span className="mt-1 text-xs text-slate-500">
              Images, PDF and supporting documents
            </span>

            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              {file.type.startsWith("image/") ? (
                <Image className="h-7 w-7 text-cyan-400" />
              ) : (
                <FileText className="h-7 w-7 text-cyan-400" />
              )}

              <div>
                <p className="text-sm font-medium text-white">
                  {file.name}
                </p>

                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearFile}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Related Test
          </label>

          <select
            value={testInstanceId}
            onChange={(e) => setTestInstanceId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          >
            <option value="">General Evaluation Evidence</option>

            {tests
              .filter((test) => test.applicability === true)
              .map((test) => (
                <option key={test.id} value={test.id}>
                  {test.test_definition?.name ||
                    test.test_definitions?.name ||
                    test.test_definition?.code ||
                    test.test_definitions?.code ||
                    "Test"}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Example: Eccentricity test load position photograph"
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
          />
        </div>

        <Button
          type="submit"
          disabled={!file || uploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />

          {uploading ? "Uploading..." : "Upload Evidence"}
        </Button>
      </form>
    </Card>
  );
}