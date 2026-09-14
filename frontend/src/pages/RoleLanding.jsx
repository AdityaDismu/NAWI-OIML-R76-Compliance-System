import {
  ArrowRight,
  ClipboardCheck,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  useRole,
  ROLES,
} from "../context/RoleContext";


function RoleCard({
  role,
  title,
  description,
  icon: Icon,
  bullets,
}) {
  const navigate = useNavigate();
  const { enterAs } = useRole();

  function handleEnter() {
    enterAs(role);
    navigate("/", { replace: true });
  }

  const isTester = role === ROLES.TESTER;

  return (
    <button
      type="button"
      onClick={handleEnter}
      className="
        group
        w-full
        rounded-2xl
        border
        border-[#d7e0e8]
        bg-white
        p-7
        text-left
        shadow-[0_4px_18px_rgba(30,60,90,0.05)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-[#9db7ca]
        hover:shadow-[0_10px_30px_rgba(30,60,90,0.10)]
        focus:outline-none
        focus:ring-2
        focus:ring-[#1d5f8f]
        focus:ring-offset-2
      "
    >

      {/* Icon + arrow */}

      <div className="flex items-start justify-between">

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            ${
              isTester
                ? "bg-[#edf4f8] text-[#1d5f8f]"
                : "bg-[#edf6f2] text-[#2d7a58]"
            }
          `}
        >
          <Icon size={27} strokeWidth={1.8} />
        </div>

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-[#f4f7fa]
            text-[#9aa9b6]
            transition
            group-hover:bg-[#edf4f8]
            group-hover:text-[#1d5f8f]
          "
        >
          <ArrowRight
            size={17}
            className="transition group-hover:translate-x-0.5"
          />
        </div>

      </div>


      {/* Role label */}

      <p
        className="
          mt-7
          text-[11px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-[#788a9b]
        "
      >
        {isTester
          ? "Laboratory workspace"
          : "Regulatory authority workspace"}
      </p>


      {/* Title */}

      <h2 className="mt-2 text-2xl font-bold text-[#203b55]">
        {title}
      </h2>


      {/* Description */}

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#66788a]">
        {description}
      </p>


      {/* Responsibilities */}

      <div className="mt-6 space-y-3 border-t border-[#e5ebf0] pt-5">

        {bullets.map((bullet) => (
          <div
            key={bullet}
            className="flex items-start gap-3 text-sm text-[#4c6175]"
          >
            <span
              className={`
                mt-1.5
                h-2
                w-2
                shrink-0
                rounded-full
                ${
                  isTester
                    ? "bg-[#1d5f8f]"
                    : "bg-[#2d7a58]"
                }
              `}
            />

            <span>{bullet}</span>
          </div>
        ))}

      </div>


      {/* CTA */}

      <div
        className={`
          mt-7
          text-sm
          font-bold
          ${
            isTester
              ? "text-[#1d5f8f]"
              : "text-[#2d7a58]"
          }
        `}
      >
        Enter {isTester ? "Tester" : "Authority"} Workspace
      </div>

    </button>
  );
}


export default function RoleLanding() {
  return (
    <main className="min-h-screen bg-[#f4f7fa] px-5 py-12 sm:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ====================================================
            BRAND HEADER
        ===================================================== */}

        <div className="text-center">

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[#123b5d]
              text-white
              shadow-md
            "
          >
            <Scale size={31} strokeWidth={1.8} />
          </div>


          <p
            className="
              mt-7
              text-xs
              font-bold
              uppercase
              tracking-[0.22em]
              text-[#6d8092]
            "
          >
            Legal Metrology · Digital Compliance
          </p>


          <h1
            className="
              mt-3
              text-5xl
              font-bold
              tracking-tight
              text-[#173b59]
            "
          >
            NAWI
          </h1>


          <p className="mt-3 text-lg text-[#64788b]">
            Non-Automatic Weighing Instrument
            <span className="mx-2 text-[#b5c0c9]">·</span>
            Test &amp; Compliance System
          </p>


          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-[#7a8b9a]
            "
          >
            Select the workspace that matches your role
            in the evaluation process.
          </p>

        </div>


        {/* ====================================================
            ROLE CARDS
        ===================================================== */}

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <RoleCard
            role={ROLES.TESTER}
            title="Enter as Tester"
            description="
              Perform instrument testing and prepare
              evaluations for regulatory review.
            "
            icon={ClipboardCheck}
            bullets={[
              "Register weighing instruments",
              "Create and perform evaluations",
              "Record observations and automatic calculations",
              "Upload evidence and submit for review",
            ]}
          />


          <RoleCard
            role={ROLES.AUTHORITY}
            title="Enter as Authority"
            description="
              Review submitted evaluations and make
              regulatory approval decisions.
            "
            icon={ShieldCheck}
            bullets={[
              "Review submitted evaluations",
              "Inspect test results and evidence",
              "Approve or return evaluations for correction",
              "Finalize approved evaluation records",
            ]}
          />

        </div>


        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-10 text-center">

          <div className="inline-flex items-center gap-2 text-xs text-[#8796a4]">
            <ShieldCheck size={14} />
            OIML R76 evaluation workflow
          </div>

        </div>

      </div>

    </main>
  );
}