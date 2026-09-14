import {
  FileText,
  FileDown,
  RefreshCw,
} from "lucide-react";

import Button from "../ui/Button";


export default function ReportGenerator({
  onPdf,
  onWord,
  onGenerate,
  generating = false,
}) {

  return (
    <div className="flex flex-wrap gap-3">

      <Button
        onClick={onGenerate}
        disabled={generating}
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${
            generating
              ? "animate-spin"
              : ""
          }`}
        />

        {generating
          ? "Generating..."
          : "Generate Report"}
      </Button>


      <Button
        variant="secondary"
        onClick={onPdf}
        disabled={generating}
      >
        <FileDown className="mr-2 h-4 w-4" />

        PDF
      </Button>


      <Button
        variant="secondary"
        onClick={onWord}
        disabled={generating}
      >
        <FileText className="mr-2 h-4 w-4" />

        Word
      </Button>

    </div>
  );
}