import {
  Thermometer,
  Droplets,
  Gauge,
} from "lucide-react";
import Card from "../ui/Card";

function Item({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ReportEnvironment({
  environment,
}) {
  if (!environment) return null;

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Environmental Conditions
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Conditions recorded during testing.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Item
          icon={Thermometer}
          label="Temperature"
          value={
            environment.temperature != null
              ? `${environment.temperature} °C`
              : null
          }
        />

        <Item
          icon={Droplets}
          label="Relative Humidity"
          value={
            environment.humidity != null
              ? `${environment.humidity} %`
              : null
          }
        />

        <Item
          icon={Gauge}
          label="Pressure"
          value={
            environment.pressure != null
              ? `${environment.pressure} hPa`
              : null
          }
        />
      </div>

      {environment.location && (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-500">
            Test Location
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {environment.location}
          </p>
        </div>
      )}

      {environment.notes && (
        <div className="mt-4">
          <p className="text-xs text-slate-500">
            Notes
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {environment.notes}
          </p>
        </div>
      )}
    </Card>
  );
}