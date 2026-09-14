import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return <div className="min-h-screen bg-[#f4f7fa] text-[#243447]"><Sidebar /><div className="lg:pl-64"><Topbar /><main className="min-h-[calc(100vh-5rem)] p-5 lg:p-8"><Outlet /></main></div></div>;
}
