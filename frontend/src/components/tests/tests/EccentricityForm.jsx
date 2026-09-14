import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";

export default function EccentricityForm({
  test,
  evaluation,
  execute,
  executing,
}) {
  const instrumentRange =
    evaluation?.instrument_range;

  const maxCapacity =
    Number(
      instrumentRange?.max_capacity ??
        instrumentRange?.max_value ??
        0
    );

  const maximumTare =
    Number(
      instrumentRange?.maximum_tare ??
        instrumentRange?.max_tare ??
        0
    );

  /*
   * OIML R76-1 general eccentricity test load:
   *
   *     1/3 (Max + T+)
   *
   * where:
   *     Max = maximum capacity
   *     T+  = maximum additive tare
   *
   * For this instrument:
   *
   *     Max = 150 kg
   *     T+  = 30 kg
   *
   *     Test load = (150 + 30) / 3
   *                = 60 kg
   */

  const defaultLoad =
    maxCapacity > 0
      ? Number(
          (
            (maxCapacity + maximumTare) /
            3
          ).toFixed(3)
        )
      : 0;

  function createDefaultObservations() {
    return [
      {
        position: "CENTER",
        load_value: defaultLoad,
        reference_indication: defaultLoad,
        indication_value: defaultLoad,
      },
      {
        position: "FRONT_LEFT",
        load_value: defaultLoad,
        reference_indication: defaultLoad,
        indication_value: defaultLoad,
      },
      {
        position: "FRONT_RIGHT",
        load_value: defaultLoad,
        reference_indication: defaultLoad,
        indication_value: defaultLoad,
      },
      {
        position: "REAR_RIGHT",
        load_value: defaultLoad,
        reference_indication: defaultLoad,
        indication_value: defaultLoad,
      },
      {
        position: "REAR_LEFT",
        load_value: defaultLoad,
        reference_indication: defaultLoad,
        indication_value: defaultLoad,
      },
    ];
  }

  const [observations, setObservations] =
    useState(
      createDefaultObservations()
    );

  const [result, setResult] = useState(null);

  const [localError, setLocalError] =
    useState("");

  function updateObservation(
    index,
    field,
    value
  ) {
    setObservations((current) =>
      current.map(
        (observation, i) =>
          i === index
            ? {
                ...observation,
                [field]:
                  field === "position"
                    ? value
                    : Number(value),
              }
            : observation
      )
    );
  }

  function resetForm() {
    setObservations(
      createDefaultObservations()
    );

    setResult(null);
    setLocalError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError("");
    setResult(null);

    try {
      /*
       * Keep the five required positions.
       *
       * The backend performs the actual
       * compliance calculation.
       */

      const response = await execute({
        observations,
        parameters: {
          test_load: defaultLoad,
          maximum_tare: maximumTare,
        },
      });

      setResult(response);
    } catch (error) {
      setLocalError(
        error.message ||
          "Eccentricity test execution failed."
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* -------------------------------------------------- */}
      {/* Test Form */}
      {/* -------------------------------------------------- */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-panel"
      >

        {/* Header */}

        <div className="border-b border-border px-5 py-4">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="text-sm font-semibold text-white">
                Eccentricity Test
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Record the indication at each prescribed
                load position. The backend will determine
                the error and compliance result.
              </p>

            </div>

            <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
              1/3 (MAX + TARE)
            </span>

          </div>

        </div>


        {/* ------------------------------------------------ */}
        {/* Instrument Information */}
        {/* ------------------------------------------------ */}

        <div className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-4">

          <div>

            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Maximum Capacity
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {maxCapacity || "—"} kg
            </p>

          </div>


          <div>

            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Maximum Tare
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {maximumTare || "—"} kg
            </p>

          </div>


          <div>

            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Test Load
            </p>

            <p className="mt-1 text-sm font-semibold text-cyan-400">
              {defaultLoad || "—"} kg
            </p>

          </div>


          <div>

            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Serial Number
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {evaluation?.instrument
                ?.serial_number || "—"}
            </p>

          </div>

        </div>


        {/* ------------------------------------------------ */}
        {/* Test Load Explanation */}
        {/* ------------------------------------------------ */}

        <div className="border-b border-border bg-slate-950/30 px-5 py-4">

          <p className="text-xs leading-5 text-slate-400">

            Prescribed test load:

            <span className="mx-1 font-semibold text-slate-200">
              1/3 × (Max + Maximum Tare)
            </span>

            =

            <span className="mx-1 font-semibold text-cyan-400">
              {defaultLoad} kg
            </span>

          </p>

        </div>


        {/* ------------------------------------------------ */}
        {/* Observation Table */}
        {/* ------------------------------------------------ */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px] text-left">

            <thead>

              <tr className="border-b border-border bg-slate-950/40">

                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Position
                </th>

                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Load (kg)
                </th>

                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Reference Indication
                </th>

                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Indication
                </th>

                <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Result
                </th>

              </tr>

            </thead>


            <tbody>

              {observations.map(
                (
                  observation,
                  index
                ) => (

                  <tr
                    key={
                      observation.position
                    }
                    className="border-b border-slate-800/70 last:border-0"
                  >

                    {/* Position */}

                    <td className="px-5 py-4">

                      <select
                        value={
                          observation.position
                        }
                        onChange={(event) =>
                          updateObservation(
                            index,
                            "position",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                      >

                        <option value="CENTER">
                          Center
                        </option>

                        <option value="FRONT_LEFT">
                          Front Left
                        </option>

                        <option value="FRONT_RIGHT">
                          Front Right
                        </option>

                        <option value="REAR_RIGHT">
                          Rear Right
                        </option>

                        <option value="REAR_LEFT">
                          Rear Left
                        </option>

                      </select>

                    </td>


                    {/* Load */}

                    <td className="px-4 py-4">

                      <input
                        type="number"
                        step="0.001"
                        value={
                          observation.load_value
                        }
                        onChange={(event) =>
                          updateObservation(
                            index,
                            "load_value",
                            event.target.value
                          )
                        }
                        className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                      />

                    </td>


                    {/* Reference */}

                    <td className="px-4 py-4">

                      <input
                        type="number"
                        step="0.001"
                        value={
                          observation.reference_indication
                        }
                        onChange={(event) =>
                          updateObservation(
                            index,
                            "reference_indication",
                            event.target.value
                          )
                        }
                        className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                      />

                    </td>


                    {/* Indication */}

                    <td className="px-4 py-4">

                      <input
                        type="number"
                        step="0.001"
                        value={
                          observation.indication_value
                        }
                        onChange={(event) =>
                          updateObservation(
                            index,
                            "indication_value",
                            event.target.value
                          )
                        }
                        className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                      />

                    </td>


                    {/* Result */}

                    <td className="px-5 py-4">

                      <span className="text-xs text-slate-600">
                        Calculated after test
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        {/* ------------------------------------------------ */}
        {/* Actions */}
        {/* ------------------------------------------------ */}

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={resetForm}
            disabled={executing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RotateCcw size={15} />

            Reset

          </button>


          <button
            type="submit"
            disabled={executing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {executing ? (

              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Running Test...
              </>

            ) : (

              <>
                <Play size={16} />

                Run Eccentricity Test
              </>

            )}

          </button>

        </div>

      </form>


      {/* -------------------------------------------------- */}
      {/* Local Error */}
      {/* -------------------------------------------------- */}

      {localError && (

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">

          <p className="text-sm text-red-300">
            {localError}
          </p>

        </div>

      )}


      {/* -------------------------------------------------- */}
      {/* Result */}
      {/* -------------------------------------------------- */}

      {result && (

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">

          <div className="flex items-start gap-3">

            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />

            <div>

              <p className="text-sm font-semibold text-white">
                Test Executed
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Backend calculation completed successfully.
              </p>

              {result.result?.result && (

                <p className="mt-3 text-lg font-bold text-emerald-400">
                  {result.result.result}
                </p>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}