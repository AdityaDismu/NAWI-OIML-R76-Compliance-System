const styles = {
  PASS: "bg-[#eaf6ef] text-[#1d7545] border-[#bfe0cd]",
  FAIL: "bg-[#fff0ef] text-[#b33b31] border-[#e7c5c1]",
  COMPLETE: "bg-[#eaf6ef] text-[#1d7545] border-[#bfe0cd]",
  IN_PROGRESS: "bg-[#fff7e7] text-[#9a6a14] border-[#ead7aa]",
  NOT_TESTED: "bg-[#f0f3f6] text-[#687b8d] border-[#d7e0e8]",
  FINALIZED: "bg-[#edf3fa] text-[#285c8a] border-[#c7d9e8]",
  APPROVED: "bg-[#eaf6ef] text-[#1d7545] border-[#bfe0cd]",
  REJECTED: "bg-[#fff0ef] text-[#b33b31] border-[#e7c5c1]",
  SUBMITTED_FOR_REVIEW: "bg-[#edf3fa] text-[#285c8a] border-[#c7d9e8]",
  UNDER_REVIEW: "bg-[#fff7e7] text-[#9a6a14] border-[#ead7aa]",
  NA: "bg-[#f0f3f6] text-[#687b8d] border-[#d7e0e8]",
};
export default function Badge({ value, children }) { const key = String(value || children || "UNKNOWN").toUpperCase(); const label = key.replaceAll("_", " "); return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[key] || styles.NOT_TESTED}`}>{label}</span>; }
