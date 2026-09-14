import {
  ArrowLeft,
  ClipboardCheck,
} from "lucide-react";

import { Link } from "react-router-dom";

import Badge from "../ui/Badge";


function formatType(type) {
  if (!type) return "Evaluation";

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


export default function EvaluationHeader({
  evaluation,
}) {

  const instrument =
    evaluation?.instrument;


  return (
    <div className="space-y-5">

      <Link
        to="/evaluations"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </Link>


      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-4">

          <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/10 p-3">

            <ClipboardCheck
              size={25}
              className="text-cyan-400"
            />

          </div>

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-2xl font-semibold text-white">
                {instrument?.model ||
                  instrument?.model_type ||
                  "Evaluation"}
              </h1>

              <Badge>
                {evaluation?.status ||
                  "DRAFT"}
              </Badge>

            </div>

            <p className="mt-2 text-sm text-slate-400">

              {instrument?.manufacturer ||
                "Unknown manufacturer"}

              {" · "}

              {instrument?.serial_number ||
                "No serial number"}

            </p>

          </div>

        </div>


        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">

            <p className="text-xs text-slate-500">
              Class
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {instrument?.accuracy_class
                ? `Class ${instrument.accuracy_class}`
                : "—"}
            </p>

          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">

            <p className="text-xs text-slate-500">
              Evaluation
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {formatType(
                evaluation?.evaluation_type
              )}
            </p>

          </div>


          <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 sm:col-span-1">

            <p className="text-xs text-slate-500">
              Standard
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              OIML R76
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}