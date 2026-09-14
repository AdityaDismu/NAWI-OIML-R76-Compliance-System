import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import TestInstructions from "./TestInstructions";
import CalculationResult from "./CalculationResult";

import WeighingPerformanceForm from "./tests/WeighingPerformanceForm";
import EccentricityForm from "./tests/EccentricityForm";
import RepeatabilityForm from "./tests/RepeatabilityForm";
import DiscriminationForm from "./tests/DiscriminationForm";
import ZeroReturnForm from "./tests/ZeroReturnForm";
import CreepForm from "./tests/CreepForm";
import StabilityForm from "./tests/StabilityForm";
import TareForm from "./tests/TareForm";
import WarmupForm from "./tests/WarmupForm";
import TemperatureForm from "./tests/TemperatureForm";
import VoltageForm from "./tests/VoltageForm";
import TiltingForm from "./tests/TiltingForm";
import ConstructionForm from "./tests/ConstructionForm";
import DampHeatForm from "./tests/DampHeatForm";
import EmcForm from "./tests/EmcForm";
import SpanStabilityForm from "./tests/SpanStabilityForm";
import EnduranceForm from "./tests/EnduranceForm";
import { applyTestSampleData } from "../../utils/sampleData";

export default function TestWorkspace({
  test,
  evaluation,
  result,
  loading,
  executing,
  error,
  execute,
  onBack,
}) {
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading test...</span>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          Test could not be loaded.
        </div>
      </div>
    );
  }

  const definition = test.test_definition || test.test_definitions;

  const testCode = definition?.code;
  const testName =
    definition?.name ||
    definition?.title ||
    testCode ||
    "Test";

  const applicable = test.applicability === true;

  const commonProps = {
    test,
    evaluation,
    execute,
    executing,
  };

  let testForm = null;

  switch (testCode) {
    case "WEIGHING_PERFORMANCE":
      testForm = <WeighingPerformanceForm {...commonProps} />;
      break;

    case "ECCENTRICITY":
      testForm = <EccentricityForm {...commonProps} />;
      break;

    case "REPEATABILITY":
      testForm = <RepeatabilityForm {...commonProps} />;
      break;

    case "DISCRIMINATION":
      testForm = <DiscriminationForm {...commonProps} />;
      break;

    case "ZERO_RETURN":
      testForm = <ZeroReturnForm {...commonProps} />;
      break;

    case "CREEP":
      testForm = <CreepForm {...commonProps} />;
      break;

    case "STABILITY_OF_EQUILIBRIUM":
      testForm = <StabilityForm {...commonProps} />;
      break;

    case "TARE":
      testForm = <TareForm {...commonProps} />;
      break;

    case "WARM_UP":
      testForm = <WarmupForm {...commonProps} />;
      break;

    case "TEMPERATURE":
      testForm = <TemperatureForm {...commonProps} />;
      break;

    case "VOLTAGE_VARIATION":
      testForm = <VoltageForm {...commonProps} />;
      break;

    case "TILTING":
      testForm = <TiltingForm {...commonProps} />;
      break;

    case "CONSTRUCTION_CHECKLIST":
      testForm = <ConstructionForm {...commonProps} />;
      break;

    case "DAMP_HEAT":
      testForm = <DampHeatForm {...commonProps} />;
      break;

    case "EMC":
      testForm = <EmcForm {...commonProps} />;
      break;

    case "SPAN_STABILITY":
      testForm = <SpanStabilityForm {...commonProps} />;
      break;

    case "ENDURANCE":
      testForm = <EnduranceForm {...commonProps} />;
      break;

    default:
      testForm = (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          <div className="font-semibold">Test form not available</div>
          <div className="mt-1 text-sm">
            No frontend form has been mapped for test code:{" "}
            <strong>{testCode || "UNKNOWN"}</strong>
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Evaluation
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {applicable && test.status !== "COMPLETE" && (
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector(
                  "[data-nawi-test-form]"
                );

                if (form) {
                  applyTestSampleData(
                    form,
                    testCode,
                    evaluation
                  );
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100"
            >
              <Sparkles className="h-4 w-4" />
              Auto-Fill Sample Data
            </button>
          )}

          <div className="flex items-center gap-2">
          {test.status === "COMPLETE" ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Test Complete
              </span>
            </>
          ) : (
            <>
              <ClipboardCheck className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                {test.status === "IN_PROGRESS"
                  ? "Test In Progress"
                  : "Test Not Tested"}
              </span>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Test title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{testName}</h1>

        {testCode && (
          <p className="mt-1 text-sm text-gray-500">
            Test Code: {testCode}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <div className="font-semibold">Test execution error</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Not applicable */}
      {!applicable && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="font-semibold text-gray-800">
            Test Not Applicable
          </div>

          <p className="mt-1 text-sm text-gray-600">
            This test is not applicable to the current instrument.
          </p>
        </div>
      )}

      {/* Instructions */}
      {applicable && (
        <TestInstructions
          test={test}
          evaluation={evaluation}
        />
      )}

      {/* Test form */}
      {applicable && test.status !== "COMPLETE" && (
        <div data-nawi-test-form>
          {testForm}
        </div>
      )}

      {/* Calculation result */}
      {result && (
        <div className="mt-6">
          <CalculationResult result={result} />
        </div>
      )}

      {test.status === "COMPLETE" && !result && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          This test is marked complete. The saved calculation result could not be loaded yet.
        </div>
      )}
    </div>
  );
}