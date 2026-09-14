import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function CalibrationForm({
  equipmentId,
  onSave,
  saving = false,
}) {
  const [form, setForm] = useState({
    certificate_number: "",
    calibration_date: "",
    due_date: "",
    calibration_lab: "",
    uncertainty: "",
    result: "PASS",
    remarks: "",
  });

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave(equipmentId, form);
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Calibration Details
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Record the current calibration status of the equipment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Certificate Number *
            </label>

            <input
              required
              value={form.certificate_number}
              onChange={(e) =>
                updateField(
                  "certificate_number",
                  e.target.value
                )
              }
              placeholder="CAL-2026-001"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Calibration Laboratory
            </label>

            <input
              value={form.calibration_lab}
              onChange={(e) =>
                updateField(
                  "calibration_lab",
                  e.target.value
                )
              }
              placeholder="Accredited Calibration Laboratory"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Calibration Date
            </label>

            <input
              type="date"
              value={form.calibration_date}
              onChange={(e) =>
                updateField(
                  "calibration_date",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Calibration Due Date
            </label>

            <input
              type="date"
              value={form.due_date}
              onChange={(e) =>
                updateField("due_date", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Measurement Uncertainty
            </label>

            <input
              value={form.uncertainty}
              onChange={(e) =>
                updateField(
                  "uncertainty",
                  e.target.value
                )
              }
              placeholder="±0.01 kg"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Calibration Result
            </label>

            <select
              value={form.result}
              onChange={(e) =>
                updateField("result", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="CONDITIONAL">
                CONDITIONAL
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Remarks
          </label>

          <textarea
            rows={3}
            value={form.remarks}
            onChange={(e) =>
              updateField("remarks", e.target.value)
            }
            placeholder="Calibration remarks..."
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Calibration"}
        </Button>
      </form>
    </Card>
  );
}