import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Image as ImageIcon,
  Info,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import {
  getEvaluation,
  getEvaluationTests,
  approveEvaluation,
  rejectEvaluation,
  startEvaluationReview,
  finalizeEvaluation,
} from "../api/evaluations";

import {
  getAttachments,
  getAttachmentDownloadUrl,
} from "../api/attachments";


function getDefinition(test) {
  return (
    test?.test_definition ||
    test?.test_definitions ||
    null
  );
}


function getTestName(test) {
  const definition = getDefinition(test);

  return (
    definition?.name ||
    definition?.title ||
    definition?.code
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Test"
  );
}


function getTestCode(test) {
  const definition = getDefinition(test);

  return definition?.code || "—";
}


function resultOf(test) {
  return String(
    test?.result ||
    "NOT_TESTED"
  ).toUpperCase();
}


function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function statusLabel(status) {
  if (!status) return "UNKNOWN";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


export default function EvaluationReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [tests, setTests] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");


  async function load() {
    try {
      setLoading(true);
      setActionError("");

      const [
        evaluationData,
        testsData,
        attachmentsData,
      ] = await Promise.all([
        getEvaluation(id),
        getEvaluationTests(id),
        getAttachments(id),
      ]);


      setEvaluation(evaluationData);

      setTests(
        testsData?.tests ||
        testsData?.items ||
        []
      );

      setAttachments(
        attachmentsData?.items ||
        attachmentsData ||
        []
      );


      /*
       * Opening a submitted evaluation starts the
       * authority review state.
       */
      if (
        evaluationData?.status ===
        "SUBMITTED_FOR_REVIEW"
      ) {
        try {
          const reviewResponse =
            await startEvaluationReview(id);

          if (reviewResponse?.evaluation) {
            setEvaluation(
              reviewResponse.evaluation
            );
          }
        } catch (reviewError) {
          /*
           * Do not prevent the Authority from seeing
           * the evaluation if the review-state update
           * fails.
           */
          console.error(
            "Unable to start review:",
            reviewError
          );
        }
      }

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to load evaluation review."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    load();
  }, [id]);


  const summary = useMemo(() => {

    const applicable =
      tests.filter(
        (test) =>
          test.applicability === true
      );


    const passed =
      applicable.filter(
        (test) =>
          resultOf(test) === "PASS"
      );


    const failed =
      applicable.filter(
        (test) =>
          resultOf(test) === "FAIL"
      );


    const incomplete =
      applicable.filter(
        (test) =>
          test.status !== "COMPLETE" ||
          !["PASS", "FAIL"].includes(
            resultOf(test)
          )
      );


    const notApplicable =
      tests.filter(
        (test) =>
          test.applicability !== true
      );


    let overall = "INCOMPLETE";


    if (incomplete.length === 0) {
      overall =
        failed.length > 0
          ? "FAIL"
          : "PASS";
    }


    return {
      applicable: applicable.length,
      passed: passed.length,
      failed: failed.length,
      incomplete: incomplete.length,
      notApplicable: notApplicable.length,
      overall,
    };

  }, [tests]);


  async function handleApprove() {

    if (
      !window.confirm(
        "Approve this evaluation?\n\nThe evaluation will be marked as approved and will then be ready for finalization."
      )
    ) {
      return;
    }


    try {

      setBusy(true);
      setActionError("");

      const response =
        await approveEvaluation(
          id,
          notes
        );


      if (response?.evaluation) {
        setEvaluation(
          response.evaluation
        );
      } else {
        await load();
      }

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to approve evaluation."
      );

    } finally {

      setBusy(false);

    }
  }


  async function handleReject() {

    const reason =
      notes.trim();


    if (!reason) {

      setActionError(
        "Please enter authority remarks explaining what needs to be corrected before returning the evaluation."
      );

      return;
    }


    if (
      !window.confirm(
        "Return this evaluation to the tester for correction?"
      )
    ) {
      return;
    }


    try {

      setBusy(true);
      setActionError("");

      const response =
        await rejectEvaluation(
          id,
          reason
        );


      if (response?.evaluation) {
        setEvaluation(
          response.evaluation
        );
      } else {
        await load();
      }

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to return evaluation."
      );

    } finally {

      setBusy(false);

    }
  }


  async function handleFinalize() {

    if (
      !window.confirm(
        "Finalize and lock this approved evaluation?\n\nAfter finalization, the evaluation becomes a locked record."
      )
    ) {
      return;
    }


    try {

      setBusy(true);
      setActionError("");

      const response =
        await finalizeEvaluation(id);


      if (response?.evaluation) {
        setEvaluation(
          response.evaluation
        );
      } else {
        await load();
      }

    } catch (error) {

      setActionError(
        error.message ||
        "Unable to finalize evaluation."
      );

    } finally {

      setBusy(false);

    }
  }


  if (loading) {

    return (
      <div className="flex min-h-[500px] items-center justify-center text-sm text-[#6a7d8f]">
        Loading evaluation review…
      </div>
    );

  }


  if (!evaluation) {

    return (
      <Card>

        <div className="py-16 text-center">

          <XCircle
            size={32}
            className="mx-auto text-[#b33b31]"
          />

          <h2 className="mt-4 font-semibold text-[#29445d]">
            Evaluation could not be loaded
          </h2>

          <p className="mt-2 text-sm text-[#718496]">
            {actionError ||
              "The requested evaluation was not found."}
          </p>

          <Link
            to="/evaluations"
            className="mt-6 inline-block"
          >
            <Button variant="secondary">
              Back to Reviews
            </Button>
          </Link>

        </div>

      </Card>
    );

  }


  const instrument =
    evaluation.instrument || {};


  const isPending =
    evaluation.status ===
      "SUBMITTED_FOR_REVIEW" ||
    evaluation.status ===
      "UNDER_REVIEW";


  const isApproved =
    evaluation.status ===
    "APPROVED";


  const isFinalized =
    evaluation.status ===
    "FINALIZED";


  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ===================================================== */}

      <div>

        <Link
          to="/evaluations"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-[#62778b]
            transition
            hover:text-[#1d5f8f]
          "
        >
          <ArrowLeft size={16} />
          Back to Reviews
        </Link>


        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4f8] text-[#1d5f8f]">
                <ShieldCheck size={23} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#203b55]">
                  Evaluation Review
                </h1>

                <p className="mt-1 text-sm text-[#6a7d8f]">
                  Authority review of tester-submitted NAWI evaluation.
                </p>

              </div>

            </div>

          </div>


          <div className="flex flex-wrap items-center gap-2">

            <Badge value={evaluation.status} />

            <Link
              to={`/evaluations/${id}/report`}
            >
              <Button
                variant="secondary"
                size="sm"
              >
                <FileText size={15} />
                View Report
              </Button>
            </Link>

          </div>

        </div>

      </div>


      {/* ====================================================
          REVIEW STATE
      ===================================================== */}

      {evaluation.status === "REJECTED" && (

        <Card className="border-[#e7c5c1] bg-[#fff8f7]">

          <div className="flex items-start gap-3">

            <XCircle
              size={20}
              className="mt-0.5 text-[#b33b31]"
            />

            <div>

              <p className="font-semibold text-[#9e3c34]">
                Returned for correction
              </p>

              <p className="mt-1 text-sm leading-6 text-[#6f6670]">
                {evaluation.rejection_reason ||
                  "The authority returned this evaluation for correction."}
              </p>

            </div>

          </div>

        </Card>

      )}


      {evaluation.status === "APPROVED" && (

        <Card className="border-[#bfe0cd] bg-[#f7fcf9]">

          <div className="flex items-start gap-3">

            <CheckCircle2
              size={20}
              className="mt-0.5 text-[#2d7a58]"
            />

            <div>

              <p className="font-semibold text-[#236440]">
                Evaluation approved
              </p>

              <p className="mt-1 text-sm text-[#5f7568]">
                The evaluation has been approved and is ready to be finalized and locked.
              </p>

            </div>

          </div>

        </Card>

      )}


      {isFinalized && (

        <Card className="border-[#c7d9e8] bg-[#f5f9fc]">

          <div className="flex items-start gap-3">

            <LockKeyhole
              size={20}
              className="mt-0.5 text-[#285c8a]"
            />

            <div>

              <p className="font-semibold text-[#285c8a]">
                Evaluation finalized
              </p>

              <p className="mt-1 text-sm text-[#607589]">
                This evaluation is now a locked record.
              </p>

            </div>

          </div>

        </Card>

      )}


      {/* ====================================================
          INSTRUMENT DETAILS
      ===================================================== */}

      <Card>

        <div className="flex items-center gap-2">

          <ScaleIcon />

          <div>

            <h2 className="font-semibold text-[#29445d]">
              Instrument Information
            </h2>

            <p className="mt-1 text-xs text-[#718496]">
              Instrument configuration submitted with this evaluation.
            </p>

          </div>

        </div>


        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <InfoField
            label="Manufacturer"
            value={instrument.manufacturer}
          />

          <InfoField
            label="Model / Type"
            value={
              instrument.model_type ||
              instrument.model
            }
          />

          <InfoField
            label="Serial Number"
            value={instrument.serial_number}
          />

          <InfoField
            label="Accuracy Class"
            value={
              instrument.accuracy_class
                ? `Class ${instrument.accuracy_class}`
                : "—"
            }
          />

        </div>

      </Card>


      {/* ====================================================
          COMPLIANCE SUMMARY
      ===================================================== */}

      <Card>

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-[#29445d]">
              Compliance Summary
            </h2>

            <p className="mt-1 text-xs text-[#718496]">
              Summary of applicable test outcomes.
            </p>

          </div>


          <Badge value={summary.overall} />

        </div>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <SummaryBox
            label="Applicable"
            value={summary.applicable}
          />

          <SummaryBox
            label="Passed"
            value={summary.passed}
            icon={CheckCircle2}
            iconClass="text-[#2d7a58]"
          />

          <SummaryBox
            label="Failed"
            value={summary.failed}
            icon={XCircle}
            iconClass="text-[#b33b31]"
          />

          <SummaryBox
            label="Not Tested"
            value={summary.incomplete}
            icon={Info}
            iconClass="text-[#9a6a14]"
          />

          <SummaryBox
            label="Not Applicable"
            value={summary.notApplicable}
            icon={ClipboardCheck}
            iconClass="text-[#718496]"
          />

        </div>


        {summary.overall === "FAIL" && (

          <div className="mt-5 rounded-lg border border-[#e7c5c1] bg-[#fff8f7] p-4">

            <p className="text-sm font-semibold text-[#9e3c34]">
              Evaluation is non-compliant
            </p>

            <p className="mt-1 text-sm text-[#6f6670]">
              One or more applicable tests have failed.
              The Authority should review the failed tests and supporting evidence before making a decision.
            </p>

          </div>

        )}


        {summary.overall === "PASS" && (

          <div className="mt-5 rounded-lg border border-[#bfe0cd] bg-[#f7fcf9] p-4">

            <p className="text-sm font-semibold text-[#236440]">
              All applicable tests passed
            </p>

            <p className="mt-1 text-sm text-[#5f7568]">
              The recorded applicable test results are within their respective acceptance criteria.
            </p>

          </div>

        )}

      </Card>


      {/* ====================================================
          TEST REVIEW
      ===================================================== */}

      <Card className="overflow-hidden p-0">

        <div className="border-b border-[#dce5ec] px-6 py-5">

          <div className="flex items-center gap-2">

            <ClipboardCheck
              size={19}
              className="text-[#1d5f8f]"
            />

            <div>

              <h2 className="font-semibold text-[#29445d]">
                Test Results Review
              </h2>

              <p className="mt-1 text-xs text-[#718496]">
                Read-only view of observations and calculated outcomes submitted by the tester.
              </p>

            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-[#dce5ec] bg-[#f4f7fa]">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                  Test
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                  Applicability
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                  Completion
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                  Result
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                  Reason / Note
                </th>

              </tr>

            </thead>


            <tbody>

              {tests.map((test) => {

                const applicable =
                  test.applicability === true;

                const result =
                  resultOf(test);


                return (
                  <tr
                    key={test.id}
                    className="border-b border-[#e5ebf0] last:border-0"
                  >

                    <td className="px-5 py-5">

                      <p className="font-medium text-[#29445d]">
                        {getTestName(test)}
                      </p>

                      <p className="mt-1 text-[11px] text-[#8a99a7]">
                        {getTestCode(test)}
                      </p>

                    </td>


                    <td className="px-5 py-5">

                      <Badge
                        value={
                          applicable
                            ? "APPLICABLE"
                            : "NA"
                        }
                      />

                    </td>


                    <td className="px-5 py-5">

                      <Badge
                        value={
                          applicable
                            ? test.status ||
                              "NOT_TESTED"
                            : "NA"
                        }
                      />

                    </td>


                    <td className="px-5 py-5">

                      <Badge
                        value={
                          applicable
                            ? result
                            : "NA"
                        }
                      />

                    </td>


                    <td className="max-w-[320px] px-5 py-5 text-sm text-[#6a7d8f]">

                      {test.applicability_reason ||
                        (applicable
                          ? "Test result submitted for authority review."
                          : "This test is not applicable to the instrument.")}

                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>

      </Card>


      {/* ====================================================
          EVIDENCE
      ===================================================== */}

      <Card>

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <ImageIcon
                size={19}
                className="text-[#1d5f8f]"
              />

              <h2 className="font-semibold text-[#29445d]">
                Supporting Evidence
              </h2>

            </div>

            <p className="mt-1 text-xs text-[#718496]">
              Evidence uploaded by the tester for this evaluation.
            </p>

          </div>

          <span className="text-sm font-semibold text-[#718496]">
            {attachments.length} file
            {attachments.length === 1
              ? ""
              : "s"}
          </span>

        </div>


        {attachments.length === 0 ? (

          <div className="mt-5 rounded-lg border border-dashed border-[#d7e0e8] bg-[#f8fafb] px-5 py-8 text-center">

            <ImageIcon
              size={26}
              className="mx-auto text-[#9aa8b4]"
            />

            <p className="mt-3 text-sm font-medium text-[#62778b]">
              No evidence uploaded
            </p>

            <p className="mt-1 text-xs text-[#8a99a7]">
              No supporting files are attached to this evaluation.
            </p>

          </div>

        ) : (

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {attachments.map((attachment) => {

              const url =
                getAttachmentDownloadUrl(
                  attachment.id
                );


              const isImage =
                String(
                  attachment.content_type ||
                  attachment.file_type ||
                  ""
                ).startsWith("image/");


              return (
                <div
                  key={attachment.id}
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#d7e0e8]
                    bg-[#f8fafb]
                  "
                >

                  {isImage ? (

                    <img
                      src={url}
                      alt={
                        attachment.description ||
                        attachment.file_name
                      }
                      className="
                        h-40
                        w-full
                        bg-[#eef2f5]
                        object-contain
                      "
                    />

                  ) : (

                    <div className="flex h-40 items-center justify-center bg-[#eef2f5]">

                      <FileText
                        size={38}
                        className="text-[#7d91a2]"
                      />

                    </div>

                  )}


                  <div className="p-4">

                    <p className="truncate text-sm font-semibold text-[#3d566c]">
                      {attachment.file_name}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#748697]">
                      {attachment.description ||
                        "Supporting evidence"}
                    </p>

                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        text-xs
                        font-semibold
                        text-[#1d5f8f]
                        hover:text-[#174f78]
                      "
                    >
                      <Eye size={13} />
                      Open Evidence
                    </a>

                  </div>

                </div>
              );

            })}

          </div>

        )}

      </Card>


      {/* ====================================================
          REVIEW INFORMATION
      ===================================================== */}

      <Card>

        <div className="grid gap-5 md:grid-cols-3">

          <InfoField
            label="Submitted"
            value={formatDate(
              evaluation.submitted_at
            )}
          />

          <InfoField
            label="Reviewed"
            value={formatDate(
              evaluation.reviewed_at
            )}
          />

          <InfoField
            label="Approved"
            value={formatDate(
              evaluation.approved_at
            )}
          />

        </div>

      </Card>


      {/* ====================================================
          AUTHORITY DECISION
      ===================================================== */}

      {isPending && (

        <Card className="border-[#cfdde7]">

          <div>

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={20}
                className="text-[#1d5f8f]"
              />

              <h2 className="font-semibold text-[#29445d]">
                Authority Decision
              </h2>

            </div>

            <p className="mt-1 text-sm text-[#718496]">
              Record your review remarks before approving or returning this evaluation.
            </p>

          </div>


          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={5}
            placeholder="Enter authority remarks. For a return/rejection, clearly explain what the tester needs to correct or review."
            className="
              mt-5
              w-full
              rounded-lg
              border
              border-[#cfd9e2]
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-[#29445d]
              outline-none
              transition
              placeholder:text-[#9aa8b4]
              focus:border-[#1d5f8f]
              focus:ring-2
              focus:ring-[#1d5f8f]/10
            "
          />


          {actionError && (

            <div className="mt-4 rounded-lg border border-[#e7c5c1] bg-[#fff8f7] p-4 text-sm text-[#a33d35]">
              {actionError}
            </div>

          )}


          <div className="mt-5 flex flex-wrap justify-end gap-3">

            <Button
              variant="danger"
              onClick={handleReject}
              disabled={busy}
            >
              <XCircle size={16} />
              Return for Correction
            </Button>


            <Button
              variant="success"
              onClick={handleApprove}
              disabled={busy}
            >
              <CheckCircle2 size={16} />

              {busy
                ? "Processing..."
                : "Approve Evaluation"}
            </Button>

          </div>

        </Card>

      )}


      {/* ====================================================
          FINALIZATION
      ===================================================== */}

      {isApproved && (

        <Card className="border-[#bfe0cd] bg-[#f7fcf9]">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <LockKeyhole
                  size={20}
                  className="text-[#2d7a58]"
                />

                <h2 className="font-semibold text-[#29445d]">
                  Ready for Finalization
                </h2>

              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#617568]">
                The evaluation has been approved. Finalization will lock the evaluation record and prevent further changes.
              </p>

            </div>


            <Button
              variant="primary"
              onClick={handleFinalize}
              disabled={busy}
            >
              <LockKeyhole size={16} />

              {busy
                ? "Finalizing..."
                : "Finalize & Lock"}
            </Button>

          </div>


          {actionError && (

            <div className="mt-4 rounded-lg border border-[#e7c5c1] bg-[#fff8f7] p-4 text-sm text-[#a33d35]">
              {actionError}
            </div>

          )}

        </Card>

      )}


      {/* ====================================================
          FINALIZED
      ===================================================== */}

      {isFinalized && (

        <Card className="border-[#c7d9e8] bg-[#f5f9fc]">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <LockKeyhole
                  size={20}
                  className="text-[#285c8a]"
                />

                <h2 className="font-semibold text-[#29445d]">
                  Finalized Record
                </h2>

              </div>

              <p className="mt-1 text-sm text-[#6a7d8f]">
                This evaluation is locked and retained as a finalized record.
              </p>

            </div>


            <Link
              to={`/evaluations/${id}/report`}
            >
              <Button variant="secondary">
                <FileText size={16} />
                Open Report
              </Button>
            </Link>

          </div>

        </Card>

      )}

    </div>
  );
}


/* ============================================================
   SMALL COMPONENTS
============================================================ */

function InfoField({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a99a7]">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-[#3d566c]">
        {value || "—"}
      </p>

    </div>
  );
}


function SummaryBox({
  label,
  value,
  icon: Icon,
  iconClass = "text-[#718496]",
}) {
  return (
    <div className="rounded-lg border border-[#e1e8ee] bg-[#f8fafb] p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium text-[#718496]">
          {label}
        </p>

        {Icon && (
          <Icon
            size={16}
            className={iconClass}
          />
        )}

      </div>

      <p className="mt-2 text-2xl font-semibold text-[#29445d]">
        {value}
      </p>

    </div>
  );
}


function ScaleIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4f8] text-[#1d5f8f]">
      <ClipboardCheck size={18} />
    </div>
  );
}