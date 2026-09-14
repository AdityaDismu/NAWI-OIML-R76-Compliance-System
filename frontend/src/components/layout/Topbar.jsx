import {
  Bell,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useRole,
  ROLES,
} from "../../context/RoleContext";


export default function Topbar() {
  const navigate = useNavigate();

  const {
    role,
    exitRole,
  } = useRole();

  const tester = role === ROLES.TESTER;
  const authority = role === ROLES.AUTHORITY;


  function handleExit() {
    exitRole();
    navigate("/enter", { replace: true });
  }


  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-[#d7e0e8]
        bg-white
        px-5
        lg:px-7
      "
    >

      {/* ======================================================
          PAGE CONTEXT
      ======================================================= */}

      <div className="hidden md:block">

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a99a7]">
          NAWI
        </p>

        <p className="mt-0.5 text-sm font-semibold text-[#29445d]">
          {tester
            ? "Tester Workspace"
            : authority
              ? "Authority Workspace"
              : "Workspace"}
        </p>

      </div>


      {/* ======================================================
          RIGHT SIDE
      ======================================================= */}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">

        {/* Notifications */}

        <button
          type="button"
          title="Notifications"
          className="
            relative
            rounded-lg
            p-2.5
            text-[#6e8192]
            transition
            hover:bg-[#f3f6f8]
            hover:text-[#29445d]
          "
        >
          <Bell size={18} />

          {/* Notification dot */}

          <span
            className="
              absolute
              right-2
              top-2
              h-1.5
              w-1.5
              rounded-full
              bg-[#c28a36]
            "
          />
        </button>


        {/* Role */}

        <div
          className="
            hidden
            items-center
            gap-3
            border-l
            border-[#d7e0e8]
            pl-3
            sm:flex
          "
        >

          <div className="text-right">

            <p className="text-sm font-semibold text-[#29445d]">
              {tester
                ? "Test Officer"
                : "Legal Metrology Officer"}
            </p>

            <p className="text-[11px] text-[#7d8d9c]">
              {tester
                ? "Laboratory Testing"
                : "Regulatory Review"}
            </p>

          </div>


          <div
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-xs
              font-bold
              ${
                tester
                  ? "bg-[#eaf2f7] text-[#1d5f8f]"
                  : "bg-[#edf6f2] text-[#2d7a58]"
              }
            `}
          >
            {tester ? "TO" : "LM"}
          </div>

        </div>


        {/* Exit */}

        <button
          type="button"
          onClick={handleExit}
          title="Exit workspace"
          className="
            rounded-lg
            p-2.5
            text-[#7c8c9b]
            transition
            hover:bg-[#f3f6f8]
            hover:text-[#29445d]
          "
        >
          <LogOut size={17} />
        </button>

      </div>

    </header>
  );
}