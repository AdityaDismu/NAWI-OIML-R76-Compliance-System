import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const initialForm = {
  name: "",
  equipment_type: "",
  manufacturer: "",
  model: "",
  serial_number: "",
  capacity: "",
  accuracy: "",
  resolution: "",
  status: "ACTIVE",
  notes: "",
};

export default function EquipmentForm({
  initialData = null,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(
    initialData || initialForm
  );

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...form,
      capacity:
        form.capacity === ""
          ? null
          : Number(form.capacity),
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          {initialData
            ? "Edit Test Equipment"
            : "Register Test Equipment"}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Maintain the equipment used during NAWI testing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Equipment Name *
            </label>

            <input
              required
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              placeholder="Standard Weight Set"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Equipment Type *
            </label>

            <select
              required
              value={form.equipment_type}
              onChange={(e) =>
                updateField(
                  "equipment_type",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="">Select type</option>
              <option value="STANDARD_WEIGHTS">
                Standard Weights
              </option>
              <option value="REFERENCE_SCALE">
                Reference Scale
              </option>
              <option value="THERMOMETER">
                Thermometer
              </option>
              <option value="HYGROMETER">
                Hygrometer
              </option>
              <option value="VOLTAGE_SOURCE">
                Voltage Source
              </option>
              <option value="EMC_EQUIPMENT">
                EMC Equipment
              </option>
              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Manufacturer
            </label>

            <input
              value={form.manufacturer}
              onChange={(e) =>
                updateField(
                  "manufacturer",
                  e.target.value
                )
              }
              placeholder="Manufacturer"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Model
            </label>

            <input
              value={form.model}
              onChange={(e) =>
                updateField("model", e.target.value)
              }
              placeholder="Model number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Serial Number
            </label>

            <input
              value={form.serial_number}
              onChange={(e) =>
                updateField(
                  "serial_number",
                  e.target.value
                )
              }
              placeholder="Serial number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Capacity
            </label>

            <input
              type="number"
              step="0.001"
              value={form.capacity}
              onChange={(e) =>
                updateField("capacity", e.target.value)
              }
              placeholder="150"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Accuracy
            </label>

            <input
              value={form.accuracy}
              onChange={(e) =>
                updateField("accuracy", e.target.value)
              }
              placeholder="±0.05 kg"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Resolution
            </label>

            <input
              value={form.resolution}
              onChange={(e) =>
                updateField("resolution", e.target.value)
              }
              placeholder="0.01 kg"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          >
            <option value="ACTIVE">Active</option>
            <option value="CALIBRATION_DUE">
              Calibration Due
            </option>
            <option value="OUT_OF_SERVICE">
              Out of Service
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Notes
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) =>
              updateField("notes", e.target.value)
            }
            placeholder="Equipment notes..."
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : initialData
            ? "Update Equipment"
            : "Register Equipment"}
        </Button>
      </form>
    </Card>
  );
}