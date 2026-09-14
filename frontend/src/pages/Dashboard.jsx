import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck,
  Inbox,
  Scale,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  Link,
} from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import RecentEvaluations from "../components/dashboard/RecentEvaluations";

import {
  getDashboard,
} from "../api/dashboard";

import {
  getEvaluations,
} from "../api/evaluations";

import {
  useRole,
  ROLES,
} from "../context/RoleContext";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";


export default function Dashboard() {
  const { role } = useRole();

  if (role === ROLES.AUTHORITY) {
    return <AuthorityDashboard />;
  }

  return <TesterDashboard />;
}


/* ============================================================
   TESTER DASHBOARD
============================================================ */

function TesterDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setSummary)
      .catch((error) => {
        console.error(
          "Dashboard load failed:",
          error
        );
      });
  }, []);


  return (
    <div className="min-h-full">

      <PageHeader
        title="Dashboard"
        description="Overview of NAWI testing and regulatory evaluations."
      />


      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Instruments"
          value={summary?.total_instruments}
          description="Registered instruments"
          icon={Scale}
          iconClass="bg-[#e8f2f9] text-[#17628f]"
        />

        <StatCard
          title="Active Evaluations"
          value={summary?.active_evaluations}
          description="Currently in progress"
          icon={Activity}
          iconClass="bg-[#edf6f2] text-[#2d7a58]"
        />

        <StatCard
          title="Completed Evaluations"
          value={summary?.completed_evaluations}
          description="Completed testing"
          icon={ClipboardCheck}
          iconClass="bg-[#f0eef8] text-[#62558a]"
        />

        <StatCard
          title="Finalized Evaluations"
          value={summary?.finalized_evaluations}
          description="Locked evaluations"
          icon={FileCheck}
          iconClass="bg-[#f8f2e7] text-[#9a7435]"
        />

      </div>


      <div
        className="
          mt-7
          overflow-hidden
          rounded-xl
          border
          border-[#dce5ec]
          bg-white
          shadow-[0_2px_8px_rgba(30,60,90,0.04)]
        "
      >

        <div className="border-b border-[#e5ebf0] px-6 py-5">

          <h2 className="text-lg font-semibold text-[#183b59]">
            Recent Evaluations
          </h2>

          <p className="mt-1 text-sm text-[#718292]">
            Latest instrument testing and evaluation activity.
          </p>

        </div>

        <div className="p-1">
          <RecentEvaluations />
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   AUTHORITY DASHBOARD
============================================================ */

function AuthorityDashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);


  async function loadEvaluations() {
    try {
      setLoading(true);

      const response = await getEvaluations();

      setEvaluations(
        response?.evaluations || []
      );

    } catch (error) {
      console.error(
        "Authority dashboard load failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadEvaluations();
  }, []);


  const summary = useMemo(() => {

    const submitted = evaluations.filter(
      (evaluation) =>
        evaluation.status === "SUBMITTED_FOR_REVIEW"
    ).length;

    const underReview = evaluations.filter(
      (evaluation) =>
        evaluation.status === "UNDER_REVIEW"
    ).length;

    const approved = evaluations.filter(
      (evaluation) =>
        evaluation.status === "APPROVED"
    ).length;

    const rejected = evaluations.filter(
      (evaluation) =>
        evaluation.status === "REJECTED"
    ).length;

    const finalized = evaluations.filter(
      (evaluation) =>
        evaluation.status === "FINALIZED"
    ).length;

    return {
      submitted,
      underReview,
      approved,
      rejected,
      finalized,
    };

  }, [evaluations]);


  const pendingReviews = useMemo(() => {

    return evaluations
      .filter(
        (evaluation) =>
          evaluation.status === "SUBMITTED_FOR_REVIEW" ||
          evaluation.status === "UNDER_REVIEW"
      )
      .slice(0, 5);

  }, [evaluations]);


  return (
    <div className="space-y-7">

      <PageHeader
        title="Authority Dashboard"
        description="Review submitted NAWI evaluations and manage regulatory decisions."
      />


      {/* ====================================================
          REVIEW QUEUE
      ===================================================== */}

      <div
        className="
          rounded-xl
          border
          border-[#dce5ec]
          bg-white
          p-6
          shadow-[0_2px_8px_rgba(30,60,90,0.04)]
        "
      >

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Inbox
                size={19}
                className="text-[#1d5f8f]"
              />

              <h2 className="text-lg font-semibold text-[#183b59]">
                Review Queue
              </h2>

            </div>

            <p className="mt-1 text-sm text-[#718292]">
              Evaluations submitted by testers that require authority review.
            </p>

          </div>


          <Link to="/evaluations">

            <Button variant="secondary" size="sm">
              View All Reviews
            </Button>

          </Link>

        </div>


        {/* Queue */}

        <div className="mt-6">

          {loading ? (

            <div className="py-8 text-center text-sm text-[#718292]">
              Loading review queue...
            </div>

          ) : pendingReviews.length === 0 ? (

            <div
              className="
                rounded-lg
                border
                border-dashed
                border-[#d7e0e8]
                bg-[#f8fafb]
                px-5
                py-10
                text-center
              "
            >

              <CheckCircle2
                size={27}
                className="mx-auto text-[#2d7a58]"
              />

              <p className="mt-3 text-sm font-semibold text-[#40566b]">
                No evaluations awaiting review
              </p>

              <p className="mt-1 text-xs text-[#8795a3]">
                The review queue is currently clear.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-[#e5ebf0] rounded-lg border border-[#e1e8ee]">

              {pendingReviews.map(
                (evaluation) => {

                  const instrument =
                    evaluation.instrument;

                  return (
                    <div
                      key={evaluation.id}
                      className="
                        flex
                        flex-col
                        gap-4
                        px-5
                        py-4
                        transition
                        hover:bg-[#f8fafb]
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-semibold text-[#29445d]">
                            {instrument?.model_type ||
                              "Unknown instrument"}
                          </p>

                          <Badge
                            value={evaluation.status}
                          />

                        </div>

                        <p className="mt-1 text-xs text-[#718292]">
                          {instrument?.serial_number ||
                            "No serial number"}
                        </p>

                      </div>


                      <Link
                        to={`/evaluations/${evaluation.id}/review`}
                      >

                        <Button
                          size="sm"
                          variant="secondary"
                        >
                          Review
                        </Button>

                      </Link>

                    </div>
                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          AUTHORITY STATS
      ===================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        <AuthorityStat
          title="Pending Review"
          value={summary.submitted}
          description="Awaiting review"
          icon={Inbox}
          iconClass="bg-[#edf4f8] text-[#1d5f8f]"
        />

        <AuthorityStat
          title="Under Review"
          value={summary.underReview}
          description="Currently reviewing"
          icon={Clock3}
          iconClass="bg-[#fff7e7] text-[#9a6a14]"
        />

        <AuthorityStat
          title="Approved"
          value={summary.approved}
          description="Approved evaluations"
          icon={CheckCircle2}
          iconClass="bg-[#edf6f2] text-[#2d7a58]"
        />

        <AuthorityStat
          title="Returned"
          value={summary.rejected}
          description="Sent for correction"
          icon={XCircle}
          iconClass="bg-[#fff0ef] text-[#b33b31]"
        />

        <AuthorityStat
          title="Finalized"
          value={summary.finalized}
          description="Locked records"
          icon={FileCheck}
          iconClass="bg-[#f8f2e7] text-[#9a7435]"
        />

      </div>


      {/* ====================================================
          WORKFLOW EXPLANATION
      ===================================================== */}

      <div
        className="
          rounded-xl
          border
          border-[#dce5ec]
          bg-white
          p-6
          shadow-[0_2px_8px_rgba(30,60,90,0.04)]
        "
      >

        <h2 className="text-lg font-semibold text-[#183b59]">
          Authority Workflow
        </h2>

        <p className="mt-1 text-sm text-[#718292]">
          Review submitted work, return corrections when necessary,
          and finalize approved evaluation records.
        </p>


        <div className="mt-6 grid gap-4 md:grid-cols-4">

          <WorkflowStep
            number="01"
            title="Review"
            description="Inspect tests, calculations and evidence."
          />

          <WorkflowStep
            number="02"
            title="Decide"
            description="Approve the evaluation or return it for correction."
          />

          <WorkflowStep
            number="03"
            title="Finalize"
            description="Lock an approved evaluation as the final record."
          />

          <WorkflowStep
            number="04"
            title="Record"
            description="Keep the finalized evaluation available for history and audit."
          />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   TESTER STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#dce5ec]
        bg-white
        p-5
        shadow-[0_2px_8px_rgba(30,60,90,0.04)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_5px_15px_rgba(30,60,90,0.08)]
      "
    >

      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >
        <Icon
          size={21}
          strokeWidth={1.8}
        />
      </div>


      <div className="mt-5">

        <p className="text-sm font-medium text-[#718292]">
          {title}
        </p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-[#183b59]">
          {value ?? "—"}
        </p>

        <p className="mt-1 text-xs text-[#8a99a6]">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   AUTHORITY STAT
============================================================ */

function AuthorityStat({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#dce5ec]
        bg-white
        p-5
        shadow-[0_2px_8px_rgba(30,60,90,0.04)]
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >
        <Icon size={19} />
      </div>

      <p className="mt-4 text-xs font-medium text-[#718292]">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#183b59]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#8a99a6]">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   WORKFLOW STEP
============================================================ */

function WorkflowStep({
  number,
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-[#e1e8ee]
        bg-[#f8fafb]
        p-4
      "
    >

      <p className="text-[11px] font-bold tracking-wider text-[#8a99a6]">
        {number}
      </p>

      <p className="mt-2 text-sm font-semibold text-[#29445d]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[#718292]">
        {description}
      </p>

    </div>
  );
}