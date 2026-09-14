import {
  AlertCircle,
  FileText,
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import EvaluationHeader from "../components/evaluations/EvaluationHeader";
import EvaluationProgress from "../components/evaluations/EvaluationProgress";
import TestList from "../components/evaluations/TestList";
import FinalizePanel from "../components/evaluations/FinalizePanel";

import EnvironmentForm from "../components/environment/EnvironmentForm";

import { useEvaluation } from "../hooks/useEvaluations";
import { submitEvaluation } from "../api/evaluations";

import {
  useRole,
  ROLES,
} from "../context/RoleContext";


export default function EvaluationWorkspace() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    role,
  } = useRole();


  const tester =
    role === ROLES.TESTER;


  /*
   * Authority users must never enter the Tester
   * workspace. Redirect them to the read-only review
   * page immediately.
   */
  if (role === ROLES.AUTHORITY) {

    return (
      <Navigate
        to={`/evaluations/${id}/review`}
        replace
      />
    );

  }


  const {
    evaluation,
    tests,
    loading,
    error,
    reload,
    finalize,
  } = useEvaluation(id);


  const [
    busy,
    setBusy,
  ] = useState(false);


  const [
    actionError,
    setActionError,
  ] = useState(null);


  async function handleSubmit() {

    if (
      !window.confirm(
        "Submit this completed evaluation to the Legal Metrology Officer for review?"
      )
    ) {
      return;
    }


    try {

      setBusy(true);
      setActionError(null);

      await submitEvaluation(id);

      await reload();

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to submit evaluation."
      );

    } finally {

      setBusy(false);

    }
  }


  async function handleFinalize() {

    if (
      !window.confirm(
        "Finalize this evaluation? It will become locked."
      )
    ) {
      return;
    }


    try {

      setBusy(true);
      setActionError(null);

      await finalize();

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to finalize evaluation."
      );

      await reload();

    } finally {

      setBusy(false);

    }
  }


  if (loading) {

    return (
      <div className="flex min-h-[500px] items-center justify-center text-sm text-[#6a7d8f]">

        <Loader2
          className="mr-2 animate-spin"
          size={19}
        />

        Loading evaluation…

      </div>
    );

  }


  if (error || !evaluation) {

    return (
      <Card>

        <div className="py-16 text-center">

          <AlertCircle
            className="mx-auto text-[#b33b31]"
            size={30}
          />

          <h2 className="mt-3 font-semibold text-[#29445d]">
            Unable to load evaluation
          </h2>

          <p className="mt-2 text-sm text-[#6a7d8f]">
            {error ||
              "Evaluation not found."}
          </p>

        </div>

      </Card>
    );

  }


  const editable =
    tester &&
    [
      "DRAFT",
      "IN_PROGRESS",
      "REJECTED",
    ].includes(
      evaluation.status
    );


  return (
    <div className="space-y-6">

      <EvaluationHeader
        evaluation={evaluation}
      />


      {/* ====================================================
          REJECTED NOTICE
      ===================================================== */}

      {evaluation.status === "REJECTED" && (

        <Card className="border-[#e7c5c1] bg-[#fff8f7]">

          <div>

            <p className="text-sm font-semibold text-[#9e3c34]">
              Returned for correction
            </p>

            <p className="mt-1 text-sm leading-6 text-[#6f6670]">
              {evaluation.rejection_reason ||
                "The reviewing officer returned this evaluation for correction."}
            </p>

          </div>

        </Card>

      )}


      {/* ====================================================
          STATUS MESSAGE
      ===================================================== */}

      {evaluation.status !== "DRAFT" && (

        <div className="flex flex-wrap items-center gap-2">

          <Badge
            value={evaluation.status}
          />

          {evaluation.status ===
            "SUBMITTED_FOR_REVIEW" && (

            <span className="text-sm text-[#6a7d8f]">
              Awaiting authority review.
            </span>

          )}


          {evaluation.status ===
            "UNDER_REVIEW" && (

            <span className="text-sm text-[#6a7d8f]">
              A Legal Metrology Officer is reviewing this evaluation.
            </span>

          )}


          {evaluation.status ===
            "APPROVED" && (

            <span className="text-sm text-[#6a7d8f]">
              Approved and ready for finalization.
            </span>

          )}


          {evaluation.status ===
            "FINALIZED" && (

            <span className="text-sm text-[#6a7d8f]">
              This evaluation has been finalized and locked.
            </span>

          )}

        </div>

      )}


      {/* ====================================================
          ACTIONS
      ===================================================== */}

      <div className="flex flex-wrap gap-3">

        <Link
          to={`/evaluations/${id}/evidence`}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-[#cfd9e2]
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-[#486176]
            transition
            hover:bg-[#f5f8fa]
          "
        >
          <Paperclip size={16} />
          Evidence
        </Link>


        <Link
          to={`/evaluations/${id}/report`}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-[#cfd9e2]
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-[#486176]
            transition
            hover:bg-[#f5f8fa]
          "
        >
          <FileText size={16} />
          Report
        </Link>


        {editable && (

          <Button
            onClick={handleSubmit}
            disabled={busy}
          >

            <Send size={16} />

            {busy
              ? "Submitting…"
              : "Submit for Review"}

          </Button>

        )}

      </div>


      {/* ====================================================
          ACTION ERROR
      ===================================================== */}

      {actionError && (

        <Card className="border-[#e7c5c1] bg-[#fff8f7]">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={18}
              className="mt-0.5 text-[#b33b31]"
            />

            <p className="text-sm text-[#a33d35]">
              {actionError}
            </p>

          </div>

        </Card>

      )}


      {/* ====================================================
          ENVIRONMENT
      ===================================================== */}

      <EnvironmentForm
        evaluationId={evaluation.id}
        disabled={!editable}
      />


      {/* ====================================================
          PROGRESS
      ===================================================== */}

      <EvaluationProgress
        tests={tests}
      />


      {/* ====================================================
          TEST LIST
      ===================================================== */}

      <TestList
        tests={tests}
        onOpen={(test) =>
          navigate(
            `/evaluations/${id}/tests/${test.id}`
          )
        }
      />


      {/* ====================================================
          FINALIZATION
      ===================================================== */}

      {evaluation.status ===
        "APPROVED" && (

        <FinalizePanel
          evaluation={evaluation}
          tests={tests}
          onFinalize={handleFinalize}
          finalizing={busy}
        />

      )}

    </div>
  );
}