import { ChevronRight, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function InstrumentCard({ instrument }) {
  const navigate = useNavigate();

  const id = instrument.id;

  return (
    <Card
      className="cursor-pointer transition hover:-translate-y-0.5 hover:border-accent/40"
      onClick={() => navigate(`/instruments/${id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Scale size={21} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {instrument.model || "Unnamed Instrument"}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {instrument.manufacturer || "Unknown manufacturer"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Serial: {instrument.serial_number || "—"}
            </p>
          </div>
        </div>

        <ChevronRight size={19} className="text-slate-500" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {instrument.accuracy_class && (
          <Badge>{instrument.accuracy_class}</Badge>
        )}

        {instrument.category && (
          <Badge>{instrument.category}</Badge>
        )}

        {instrument.indication_type && (
          <Badge>{instrument.indication_type}</Badge>
        )}
      </div>
    </Card>
  );
}