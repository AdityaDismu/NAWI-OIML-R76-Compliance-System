import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Inbox,
  LockKeyhole,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useRole, ROLES } from "../context/RoleContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";

import { useEvaluations } from "../hooks/useEvaluations";


function formatEvaluationType(type) {
  if (!type) return "Evaluation";

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function statusVariant(status) {
  switch (status) {
    case "FINALIZED":
    case "COMPLETE":
    case "APPROVED":
      return "success";

    case "IN_PROGRESS":
    case "UNDER_REVIEW":
      return "warning";

    case "REJECTED":
      return "danger";

    case "SUBMITTED_FOR_REVIEW":
      return "info";

    default:
      return "neutral";
  }
}


function statusLabel(status) {
  if (!status) return "UNKNOWN";

  return status.replaceAll("_", " ");
}


function getInstrumentName(evaluation) {
  return (
    evaluation?.instrument?.model_type ||
    evaluation?.instrument?.model ||
    "Unknown instrument"
  );
}


function getInstrumentSerial(evaluation) {
  return (
    evaluation?.instrument?.serial_number ||
    "No serial number"
  );
}


function isReviewable(status) {
  return (
    status === "SUBMITTED_FOR_REVIEW" ||
    status === "UNDER_REVIEW"
  );
}


function isCompleted(status) {
  return (
    status === "APPROVED" ||
    status === "FINALIZED" ||
    status === "COMPLETE"
  );
}


export default function Evaluations() {
  const { role } = useRole();

  const authority = role === ROLES.AUTHORITY;

  const {
    evaluations,
    loading,
    error,
    reload,
  } = useEvaluations();


  if (authority) {
    return (
      <AuthorityEvaluations
        evaluations={evaluations}
        loading={loading}
        error={error}
        reload={reload}
      />
    );
  }


  return (
    <TesterEvaluations
      evaluations={evaluations}
      loading={loading}
      error={error}
      reload={reload}
    />
  );
}


/* ============================================================
   TESTER EVALUATIONS
============================================================ */

function TesterEvaluations({
  evaluations,
  loading,
  error,
  reload,
}) {
  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-[#203b55]">
            My Evaluations
          </h1>

          <p className="mt-1 text-sm text-[#6a7d8f]">
            Manage NAWI evaluations and compliance testing.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="secondary"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>

          <Link to="/evaluations/new">
            <Button>
              <ClipboardCheck size={17} />
              New Evaluation
            </Button>
          </Link>

        </div>

      </div>


      {error && (
        <Card>
          <div className="rounded-lg border border-[#e7c5c1] bg-[#fff8f7] p-4 text-sm text-[#a33d35]">
            {error}
          </div>
        </Card>
      )}


      {loading ? (
        <Loading />
      ) : evaluations.length === 0 ? (

        <EmptyEvaluations
          title="No evaluations yet"
          description="Create an evaluation for an instrument to begin OIML R76 compliance testing."
          action={
            <Link to="/evaluations/new">
              <Button>
                <ClipboardCheck size={17} />
                Create Evaluation
              </Button>
            </Link>
          }
        />

      ) : (

        <Card className="overflow-hidden p-0">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-[#dce5ec] bg-[#f4f7fa]">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Instrument
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Evaluation
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {evaluations.map((evaluation) => (

                  <tr
                    key={evaluation.id}
                    className="border-b border-[#e5ebf0] last:border-0 hover:bg-[#f8fafb]"
                  >

                    <td className="px-6 py-5">

                      <div className="font-medium text-[#29445d]">
                        {getInstrumentName(evaluation)}
                      </div>

                      <div className="mt-1 text-xs text-[#718496]">
                        {getInstrumentSerial(evaluation)}
                      </div>

                    </td>


                    <td className="px-6 py-5">

                      <div className="text-sm text-[#486176]">
                        {formatEvaluationType(
                          evaluation.evaluation_type
                        )}
                      </div>

                      <div className="mt-1 text-xs text-[#718496]">
                        {evaluation?.instrument?.accuracy_class
                          ? `Class ${evaluation.instrument.accuracy_class}`
                          : "—"}
                      </div>

                    </td>


                    <td className="px-6 py-5">

                      <Badge
                        value={evaluation.status}
                        variant={statusVariant(
                          evaluation.status
                        )}
                      />

                    </td>


                    <td className="px-6 py-5 text-sm text-[#6a7d8f]">
                      {formatDate(evaluation.created_at)}
                    </td>


                    <td className="px-6 py-5 text-right">

                      <Link
                        to={`/evaluations/${evaluation.id}`}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          <Eye size={15} />
                          Open
                        </Button>
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </Card>

      )}

    </div>
  );
}


/* ============================================================
   AUTHORITY EVALUATIONS
============================================================ */

function AuthorityEvaluations({
  evaluations,
  loading,
  error,
  reload,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("REVIEW_QUEUE");


  const filteredEvaluations = useMemo(() => {

    const query = search.trim().toLowerCase();

    return evaluations.filter((evaluation) => {

      const status = evaluation.status;

      let matchesFilter = true;

      if (filter === "REVIEW_QUEUE") {
        matchesFilter = isReviewable(status);
      }

      if (filter === "APPROVED") {
        matchesFilter = status === "APPROVED";
      }

      if (filter === "REJECTED") {
        matchesFilter = status === "REJECTED";
      }

      if (filter === "FINALIZED") {
        matchesFilter = status === "FINALIZED";
      }

      if (filter === "ALL") {
        matchesFilter = true;
      }


      if (!matchesFilter) {
        return false;
      }


      if (!query) {
        return true;
      }


      const instrument =
        evaluation.instrument || {};


      const searchable = [
        evaluation.id,
        evaluation.evaluation_type,
        evaluation.status,
        instrument.model,
        instrument.model_type,
        instrument.manufacturer,
        instrument.serial_number,
        instrument.accuracy_class,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      return searchable.includes(query);

    });

  }, [evaluations, filter, search]);


  const pendingCount = evaluations.filter(
    (evaluation) =>
      evaluation.status === "SUBMITTED_FOR_REVIEW"
  ).length;


  const reviewCount = evaluations.filter(
    (evaluation) =>
      evaluation.status === "UNDER_REVIEW"
  ).length;


  const approvedCount = evaluations.filter(
    (evaluation) =>
      evaluation.status === "APPROVED"
  ).length;


  const rejectedCount = evaluations.filter(
    (evaluation) =>
      evaluation.status === "REJECTED"
  ).length;


  const finalizedCount = evaluations.filter(
    (evaluation) =>
      evaluation.status === "FINALIZED"
  ).length;


  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6f2] text-[#2d7a58]">
              <Inbox size={21} />
            </div>

            <div>

              <h1 className="text-2xl font-semibold text-[#203b55]">
                Evaluation Reviews
              </h1>

              <p className="mt-1 text-sm text-[#6a7d8f]">
                Review tester submissions and manage regulatory decisions.
              </p>

            </div>

          </div>

        </div>


        <Button
          variant="secondary"
          onClick={reload}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </Button>

      </div>


      {/* ====================================================
          REVIEW COUNTS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <ReviewStat
          label="Pending Review"
          value={pendingCount}
          icon={Inbox}
          active={filter === "REVIEW_QUEUE"}
          onClick={() => setFilter("REVIEW_QUEUE")}
        />

        <ReviewStat
          label="Under Review"
          value={reviewCount}
          icon={ClipboardCheck}
          active={false}
          onClick={() => setFilter("REVIEW_QUEUE")}
        />

        <ReviewStat
          label="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          active={filter === "APPROVED"}
          onClick={() => setFilter("APPROVED")}
        />

        <ReviewStat
          label="Returned"
          value={rejectedCount}
          icon={XCircle}
          active={filter === "REJECTED"}
          onClick={() => setFilter("REJECTED")}
        />

        <ReviewStat
          label="Finalized"
          value={finalizedCount}
          icon={LockKeyhole}
          active={filter === "FINALIZED"}
          onClick={() => setFilter("FINALIZED")}
        />

      </div>


      {/* ====================================================
          SEARCH + FILTER
      ===================================================== */}

      <Card>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a99a7]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by instrument, serial number, manufacturer or evaluation..."
              className="
                w-full
                rounded-lg
                border
                border-[#cfd9e2]
                bg-white
                py-2.5
                pl-10
                pr-3
                text-sm
                text-[#29445d]
                outline-none
                transition
                placeholder:text-[#9aa8b4]
                focus:border-[#1d5f8f]
                focus:ring-2
                focus:ring-[#1d5f8f]/10
              "
            />

          </div>


          <div className="flex flex-wrap gap-2">

            <FilterButton
              active={filter === "REVIEW_QUEUE"}
              onClick={() => setFilter("REVIEW_QUEUE")}
            >
              Review Queue
            </FilterButton>

            <FilterButton
              active={filter === "APPROVED"}
              onClick={() => setFilter("APPROVED")}
            >
              Approved
            </FilterButton>

            <FilterButton
              active={filter === "REJECTED"}
              onClick={() => setFilter("REJECTED")}
            >
              Returned
            </FilterButton>

            <FilterButton
              active={filter === "FINALIZED"}
              onClick={() => setFilter("FINALIZED")}
            >
              Finalized
            </FilterButton>

            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
            >
              All Records
            </FilterButton>

          </div>

        </div>

      </Card>


      {/* ====================================================
          ERROR
      ===================================================== */}

      {error && (

        <Card>

          <div className="rounded-lg border border-[#e7c5c1] bg-[#fff8f7] p-4 text-sm text-[#a33d35]">
            {error}
          </div>

        </Card>

      )}


      {/* ====================================================
          REVIEW TABLE
      ===================================================== */}

      {loading ? (

        <Loading />

      ) : filteredEvaluations.length === 0 ? (

        <Card>

          <div className="flex flex-col items-center justify-center py-16 text-center">

            <div className="mb-4 rounded-2xl bg-[#edf6f2] p-4">
              <CheckCircle2
                size={30}
                className="text-[#2d7a58]"
              />
            </div>

            <h2 className="text-lg font-semibold text-[#29445d]">
              {filter === "REVIEW_QUEUE"
                ? "Review queue is clear"
                : "No matching evaluations"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-[#718496]">
              {filter === "REVIEW_QUEUE"
                ? "There are currently no evaluations waiting for authority review."
                : "Try another status filter or search term."}
            </p>

          </div>

        </Card>

      ) : (

        <Card className="overflow-hidden p-0">

          <div className="border-b border-[#dce5ec] bg-white px-6 py-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-[#29445d]">
                  {filter === "REVIEW_QUEUE"
                    ? "Pending Authority Review"
                    : filter === "ALL"
                      ? "All Evaluation Records"
                      : `${formatFilterTitle(filter)} Evaluations`}
                </h2>

                <p className="mt-1 text-xs text-[#718496]">
                  {filteredEvaluations.length} record
                  {filteredEvaluations.length === 1
                    ? ""
                    : "s"} shown
                </p>

              </div>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-[#dce5ec] bg-[#f4f7fa]">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Instrument
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Evaluation
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Submitted
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#718496]">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredEvaluations.map(
                  (evaluation) => (

                    <tr
                      key={evaluation.id}
                      className="border-b border-[#e5ebf0] last:border-0 hover:bg-[#f8fafb]"
                    >

                      <td className="px-6 py-5">

                        <div className="font-medium text-[#29445d]">
                          {getInstrumentName(evaluation)}
                        </div>

                        <div className="mt-1 text-xs text-[#718496]">
                          {getInstrumentSerial(evaluation)}
                        </div>

                        <div className="mt-1 text-xs text-[#8a99a7]">
                          {evaluation?.instrument?.manufacturer ||
                            "Unknown manufacturer"}
                        </div>

                      </td>


                      <td className="px-6 py-5">

                        <div className="text-sm text-[#486176]">
                          {formatEvaluationType(
                            evaluation.evaluation_type
                          )}
                        </div>

                        <div className="mt-1 text-xs text-[#718496]">
                          {evaluation?.instrument?.accuracy_class
                            ? `Class ${evaluation.instrument.accuracy_class}`
                            : "—"}
                        </div>

                      </td>


                      <td className="px-6 py-5">

                        <Badge
                          value={evaluation.status}
                          variant={statusVariant(
                            evaluation.status
                          )}
                        />

                      </td>


                      <td className="px-6 py-5 text-sm text-[#6a7d8f]">

                        {formatDate(
                          evaluation.submitted_at ||
                          evaluation.created_at
                        )}

                      </td>


                      <td className="px-6 py-5 text-right">

                        <Link
                          to={`/evaluations/${evaluation.id}/review`}
                        >

                          <Button
                            variant={
                              isReviewable(
                                evaluation.status
                              )
                                ? "primary"
                                : "secondary"
                            }
                            size="sm"
                          >

                            {isReviewable(
                              evaluation.status
                            ) ? (
                              <ClipboardCheck size={15} />
                            ) : (
                              <Eye size={15} />
                            )}

                            {isReviewable(
                              evaluation.status
                            )
                              ? "Review"
                              : "View"}

                          </Button>

                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </Card>

      )}

    </div>
  );
}


/* ============================================================
   SMALL COMPONENTS
============================================================ */

function ReviewStat({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        border
        p-4
        text-left
        transition
        ${
          active
            ? "border-[#a9c4d6] bg-[#edf4f8] shadow-[0_2px_8px_rgba(30,60,90,0.05)]"
            : "border-[#dce5ec] bg-white hover:border-[#c5d3dd] hover:bg-[#fafcfd]"
        }
      `}
    >

      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            ${
              active
                ? "bg-white text-[#1d5f8f]"
                : "bg-[#f2f5f7] text-[#718496]"
            }
          `}
        >
          <Icon size={17} />
        </div>

        <span className="text-2xl font-semibold text-[#29445d]">
          {value}
        </span>

      </div>

      <p className="mt-3 text-xs font-medium text-[#718496]">
        {label}
      </p>

    </button>
  );
}


function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        border
        px-3
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "border-[#1d5f8f] bg-[#edf4f8] text-[#174f78]"
            : "border-[#cfd9e2] bg-white text-[#62778b] hover:bg-[#f5f8fa]"
        }
      `}
    >
      {children}
    </button>
  );
}


function formatFilterTitle(filter) {
  if (filter === "ALL") return "All";

  return filter
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function EmptyEvaluations({
  title,
  description,
  action,
}) {
  return (
    <Card>

      <div className="flex flex-col items-center justify-center py-16 text-center">

        <div className="mb-4 rounded-2xl bg-[#edf4f8] p-4">
          <ClipboardCheck
            size={30}
            className="text-[#1d5f8f]"
          />
        </div>

        <h2 className="text-lg font-semibold text-[#29445d]">
          {title}
        </h2>

        <p className="mt-2 max-w-md text-sm text-[#718496]">
          {description}
        </p>

        {action && (
          <div className="mt-6">
            {action}
          </div>
        )}

      </div>

    </Card>
  );
}