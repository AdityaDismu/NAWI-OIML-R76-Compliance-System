import Card from "../ui/Card";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

export default function ReportInstrumentDetails({
  instrument,
  range,
}) {
  if (!instrument) return null;

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Instrument Details
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Identification and metrological characteristics.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Manufacturer"
          value={instrument.manufacturer}
        />

        <Field
          label="Model / Type"
          value={
            instrument.model ||
            instrument.model_type
          }
        />

        <Field
          label="Serial Number"
          value={instrument.serial_number}
        />

        <Field
          label="Accuracy Class"
          value={instrument.accuracy_class}
        />

        <Field
          label="Category"
          value={instrument.category}
        />

        <Field
          label="Indication Type"
          value={instrument.indication_type}
        />

        <Field
          label="Software ID"
          value={
            instrument.software_identification
          }
        />

        <Field
          label="Software Version"
          value={instrument.software_version}
        />

        <Field
          label="Connected Modules"
          value={instrument.connected_modules}
        />
      </div>

      {range && (
        <>
          <div className="my-6 border-t border-slate-800" />

          <h3 className="mb-4 text-sm font-semibold text-slate-300">
            Weighing Range
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <Field
              label="Range Type"
              value={range.range_type}
            />

            <Field
              label="Max"
              value={
                range.max_capacity
                  ? `${range.max_capacity} kg`
                  : null
              }
            />

            <Field
              label="Min"
              value={
                range.min_capacity
                  ? `${range.min_capacity} kg`
                  : null
              }
            />

            <Field
              label="e"
              value={
                range.verification_scale_interval
                  ? `${range.verification_scale_interval} kg`
                  : null
              }
            />

            <Field
              label="d"
              value={
                range.actual_scale_interval
                  ? `${range.actual_scale_interval} kg`
                  : null
              }
            />
          </div>
        </>
      )}
    </Card>
  );
}