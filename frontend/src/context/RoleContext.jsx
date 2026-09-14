import { createContext, useContext, useMemo, useState } from "react";

const RoleContext = createContext(null);

export const ROLES = {
  TESTER: "TESTER",
  AUTHORITY: "AUTHORITY",
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("nawi_role") || null);

  function enterAs(nextRole) {
    localStorage.setItem("nawi_role", nextRole);
    setRole(nextRole);
  }

  function switchRole() {
    const next = role === ROLES.AUTHORITY ? ROLES.TESTER : ROLES.AUTHORITY;
    enterAs(next);
  }

  function exitRole() {
    localStorage.removeItem("nawi_role");
    setRole(null);
  }

  const value = useMemo(() => ({ role, enterAs, switchRole, exitRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
