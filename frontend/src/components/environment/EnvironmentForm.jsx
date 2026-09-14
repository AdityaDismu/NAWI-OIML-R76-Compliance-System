import { useEffect, useState } from "react";
import { Thermometer, Droplets, Gauge, Sparkles } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  getEvaluationEnvironment,
  saveEvaluationEnvironment,
} from "../../api/environment";
import { sampleEnvironmentForm } from "../../utils/sampleData";

export default function EnvironmentForm({ evaluationId }) {
  const [form, setForm] = useState({
    temperature: "",
    humidity: "",
    pressure: "",
    location: "",
    start_time: "",
    end_time: "",
    conditions_ok: true,
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getEvaluationEnvironment(evaluationId);

        if (data) {
          setForm((previous) => ({
            ...previous,
            ...data,
          }));
        }
      } catch (error) {
        console.error(
          "Environment data could not be loaded:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    if (evaluationId) {
      load();
    }
  }, [evaluationId]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);

      await saveEvaluationEnvironment(
        evaluationId,
        {
          ...form,
          temperature:
            form.temperature === ""
              ? null
              : Number(form.temperature),
          humidity:
            form.humidity === ""
              ? null
              : Number(form.humidity),
          pressure:
            form.pressure === ""
              ? null
              : Number(form.pressure),
        }
      );

      alert("Environmental conditions saved.");
    } catch (error) {
      console.error(error);
      alert("Unable to save environmental conditions.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-400">
          Loading environmental conditions...
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Environmental Conditions
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Record the environmental conditions maintained during
          the evaluation.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setForm(sampleEnvironmentForm())}
            disabled={saving}
          >
            <Sparkles size={16} />
            Auto-Fill Sample Data
          </Button>
          <span className="text-xs text-slate-500">
            Populate realistic laboratory conditions for prototype testing.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Temperature (°C)
            </label>

            <div className="relative">
              <Thermometer className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />

              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) =>
                  updateField("temperature", e.target.value)
                }
                placeholder="23.5"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Relative Humidity (%)
            </label>

            <div className="relative">
              <Droplets className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />

              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.humidity}
                onChange={(e) =>
                  updateField("humidity", e.target.value)
                }
                placeholder="50"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Atmospheric Pressure (hPa)
            </label>

            <div className="relative">
              <Gauge className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />

              <input
                type="number"
                step="0.1"
                value={form.pressure}
                onChange={(e) =>
                  updateField("pressure", e.target.value)
                }
                placeholder="1013"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Test Location
            </label>

            <input
              value={form.location}
              onChange={(e) =>
                updateField("location", e.target.value)
              }
              placeholder="Laboratory Test Room 01"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Start Time
            </label>

            <input
              type="datetime-local"
              value={form.start_time || ""}
              onChange={(e) =>
                updateField("start_time", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              End Time
            </label>

            <input
              type="datetime-local"
              value={form.end_time || ""}
              onChange={(e) =>
                updateField("end_time", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.conditions_ok}
              onChange={(e) =>
                updateField(
                  "conditions_ok",
                  e.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
            />

            <span className="text-sm text-slate-300">
              Environmental conditions were suitable for testing
            </span>
          </label>
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
            placeholder="Record any relevant environmental observations..."
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Conditions"}
        </Button>
      </form>
    </Card>
  );
}