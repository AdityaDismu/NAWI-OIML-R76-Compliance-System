import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  ClipboardCheck,
  Images,
  Wrench,
  History,
  ShieldCheck,
  Inbox,
  LockKeyhole,
} from "lucide-react";

import { useRole, ROLES } from "../../context/RoleContext";


export default function Sidebar() {
  const { role } = useRole();

  const tester = role === ROLES.TESTER;
  const authority = role === ROLES.AUTHORITY;


  const testerNavigation = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Instruments",
      path: "/instruments",
      icon: Scale,
    },
    {
      label: "My Evaluations",
      path: "/evaluations",
      icon: ClipboardCheck,
    },
    {
      label: "Evidence",
      path: "/evidence-repository",
      icon: Images,
    },
  ];


  const authorityNavigation = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Review Queue",
      path: "/evaluations",
      icon: Inbox,
    },
    {
      label: "Evaluation History",
      path: "/evaluations",
      icon: ClipboardCheck,
    },
    {
      label: "Finalized Records",
      path: "/evaluations",
      icon: LockKeyhole,
    },
    {
      label: "Audit Log",
      path: "/audit-log",
      icon: History,
    },
  ];


  const navigation = authority
    ? authorityNavigation
    : testerNavigation;


  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#d7e0e8] bg-white lg:block">

      <div className="flex h-full flex-col">

        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="flex h-20 items-center border-b border-[#d7e0e8] px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123b5d] text-lg font-bold text-white">
              N
            </div>

            <div>

              <h1 className="text-base font-bold text-[#173b59]">
                NAWI
              </h1>

              <p className="text-[11px] text-[#75879a]">
                Test & Compliance System
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="flex-1 space-y-1 px-3 py-6">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a99a7]">
            {authority ? "Authority Workspace" : "Tester Workspace"}
          </p>


          {navigation.map(
            ({ label, path, icon: Icon }) => (

              <NavLink
                key={label}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-[#1d5f8f] bg-[#edf4f8] text-[#174f78]"
                      : "border-transparent text-[#64788b] hover:bg-[#f5f8fa] hover:text-[#294b66]"
                  }`
                }
              >

                <Icon size={18} />

                <span>
                  {label}
                </span>

              </NavLink>

            )
          )}

        </nav>


        {/* =====================================================
            CURRENT ROLE
        ====================================================== */}

        <div className="border-t border-[#d7e0e8] p-4">

          <div className="flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-3">

            <ShieldCheck
              size={18}
              className="text-[#1d5f8f]"
            />

            <div>

              <p className="text-xs font-semibold text-[#40566b]">
                {tester
                  ? "Tester"
                  : "Legal Metrology Officer"}
              </p>

              <p className="text-[11px] text-[#8795a3]">
                {tester
                  ? "Testing & evaluation"
                  : "Review & approval"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}