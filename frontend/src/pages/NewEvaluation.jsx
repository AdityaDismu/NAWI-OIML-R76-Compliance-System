import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";

import { getInstruments } from "../api/instruments";
import { createEvaluation } from "../api/evaluations";


export default function NewEvaluation() {

  const navigate = useNavigate();

  const [instruments, setInstruments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState(null);


  const [form, setForm] = useState({
    instrument_id: "",
    evaluation_type: "INITIAL_VERIFICATION",
    notes: "",
  });


  useEffect(() => {

    async function loadInstruments() {

      try {

        setLoading(true);

        const data =
          await getInstruments();

        setInstruments(
          data.instruments || []
        );

      } catch (err) {

        setError(
          err.message ||
          "Failed to load instruments"
        );

      } finally {

        setLoading(false);

      }
    }

    loadInstruments();

  }, []);


  function updateField(field, value) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

  }


  async function handleSubmit(event) {

    event.preventDefault();

    if (!form.instrument_id) {

      setError(
        "Please select an instrument."
      );

      return;
    }

    try {

      setCreating(true);
      setError(null);

      const result =
        await createEvaluation(form);

      navigate(
        `/evaluations/${result.evaluation.id}`
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to create evaluation"
      );

    } finally {

      setCreating(false);

    }
  }


  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Back */}

      <Link
        to="/evaluations"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Evaluations
      </Link>


      {/* Header */}

      <div>

        <h1 className="text-2xl font-semibold text-white">
          New Evaluation
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Start a new OIML R76 evaluation for an instrument.
        </p>

      </div>


      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}


      {/* Form */}

      <Card>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Instrument */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Instrument
            </label>

            {loading ? (

              <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-4 text-sm text-slate-500">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Loading instruments...
              </div>

            ) : (

              <Select
                value={form.instrument_id}
                onChange={(event) =>
                  updateField(
                    "instrument_id",
                    event.target.value
                  )
                }
                disabled={creating}
              >

                <option value="">
                  Select an instrument
                </option>

                {instruments.map(
                  (instrument) => (
                    <option
                      key={instrument.id}
                      value={instrument.id}
                    >
                      {instrument.model ||
                        instrument.model_type}
                      {" — "}
                      {instrument.serial_number}
                    </option>
                  )
                )}

              </Select>

            )}

          </div>


          {/* Evaluation type */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Evaluation Type
            </label>

            <Select
              value={form.evaluation_type}
              onChange={(event) =>
                updateField(
                  "evaluation_type",
                  event.target.value
                )
              }
              disabled={creating}
            >

              <option value="INITIAL_VERIFICATION">
                Initial Verification
              </option>

              <option value="PERIODIC_VERIFICATION">
                Periodic Verification
              </option>

              <option value="TYPE_EXAMINATION">
                Type Examination
              </option>

              <option value="RE_VERIFICATION">
                Re-verification
              </option>

            </Select>

          </div>


          {/* Notes */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              rows={5}
              disabled={creating}
              placeholder="Optional evaluation notes..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>


          {/* Info */}

          <div className="flex gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">

            <ClipboardCheck
              size={20}
              className="mt-0.5 shrink-0 text-cyan-400"
            />

            <div>

              <p className="text-sm font-medium text-cyan-300">
                What happens next?
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                The system will create the evaluation
                and automatically generate the applicable
                OIML R76 test instances for the selected
                instrument.
              </p>

            </div>

          </div>


          {/* Actions */}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">

            <Link to="/evaluations">
              <Button
                type="button"
                variant="secondary"
                disabled={creating}
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={
                creating ||
                loading ||
                !form.instrument_id
              }
            >

              {creating ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <ClipboardCheck size={17} />
                  Create Evaluation
                </>
              )}

            </Button>

          </div>

        </form>

      </Card>

    </div>
  );
}