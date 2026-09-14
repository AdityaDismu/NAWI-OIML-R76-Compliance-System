import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileText, Image as ImageIcon, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ReportSummary from "../components/reports/ReportSummary";
import ReportTestResults from "../components/reports/ReportTestResults";
import ReportInstrumentDetails from "../components/reports/ReportInstrumentDetails";
import ReportEnvironment from "../components/reports/ReportEnvironment";
import ReportGenerator from "../components/reports/ReportGenerator";
import ReportHistory from "../components/reports/ReportHistory";
import { getEvaluation, getEvaluationTests } from "../api/evaluations";
import { getEvaluationEnvironment } from "../api/environment";
import { getAttachments, getAttachmentDownloadUrl } from "../api/attachments";
import { getEvaluationReports, generatePdfReport, generateWordReport, generateReport } from "../api/reports";

function resultOf(test){ return String(test.result || (test.status === "COMPLETE" ? "NOT TESTED" : test.status) || "NOT TESTED").toUpperCase(); }
function summaryOf(tests){ const a=tests.filter(t=>t.applicability===true); const p=a.filter(t=>resultOf(t)==="PASS").length; const f=a.filter(t=>resultOf(t)==="FAIL").length; const n=a.filter(t=>t.status!=="COMPLETE"||!["PASS","FAIL"].includes(resultOf(t))).length; return {applicable:a.length,passed:p,failed:f,incomplete:n,result:n?"INCOMPLETE":f?"FAIL":"PASS"}; }
export default function ReportPreview(){
 const {id}=useParams(); const [evaluation,setEvaluation]=useState(null); const [tests,setTests]=useState([]); const [environment,setEnvironment]=useState(null); const [reports,setReports]=useState([]); const [attachments,setAttachments]=useState([]); const [loading,setLoading]=useState(true); const [generating,setGenerating]=useState(false); const [error,setError]=useState("");
 async function load(){try{setLoading(true);setError("");const [e,t,env,r,a]=await Promise.all([getEvaluation(id),getEvaluationTests(id),getEvaluationEnvironment(id).catch(()=>null),getEvaluationReports(id).catch(()=>({reports:[]})),getAttachments(id).catch(()=>({items:[]}))]);setEvaluation(e);setTests(t?.tests||t?.items||[]);setEnvironment(env);setReports(r?.reports||r?.items||[]);setAttachments(a?.items||a||[]);}catch(e){setError(e.message||"Unable to load report preview.")}finally{setLoading(false)}}
 useEffect(()=>{load()},[id]); const summary=useMemo(()=>summaryOf(tests),[tests]);
 async function run(fn,msg){try{setGenerating(true);await fn();await load();alert(msg);}catch(e){alert(e.message||"Report operation failed.")}finally{setGenerating(false)}}
 if(loading)return <div className="p-8 text-sm text-[#6a7d8f]">Loading report preview…</div>;
 if(error||!evaluation)return <Card><div className="py-16 text-center text-sm text-[#6a7d8f]">{error||"Evaluation could not be found."}</div></Card>;
 const instrument=evaluation.instrument||{}; const range=evaluation.instrument_range||evaluation.range||{};
 return <div className="space-y-6">
  <PageHeader title="Report Preview" description="Review the complete compliance record. PASS and FAIL outcomes are both retained in the generated report." action={<Link to={`/evaluations/${id}`} className="inline-flex items-center gap-2 rounded-lg border border-[#cfd9e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#486176]"><ArrowLeft size={16}/>Back</Link>}/>
  <Card><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="section-kicker">NAWI · Official report record</p><h2 className="mt-1 text-2xl font-bold text-[#203b55]">{instrument.model||instrument.model_type||"Non-Automatic Weighing Instrument"}</h2><p className="mt-1 text-sm text-[#6a7d8f]">{instrument.manufacturer||"—"} · Serial {instrument.serial_number||"—"}</p></div><div className="flex flex-wrap items-center gap-3"><Badge value={summary.result}/><ReportGenerator onGenerate={()=>run(()=>generateReport(id),"Report record generated.")} onPdf={()=>run(()=>generatePdfReport(id),"PDF downloaded successfully.")} onWord={()=>run(()=>generateWordReport(id),"Word report downloaded successfully.")} generating={generating}/></div></div></Card>
  <ReportSummary tests={tests}/><ReportInstrumentDetails instrument={instrument} range={range}/><ReportEnvironment environment={environment}/><ReportTestResults tests={tests}/>
  <Card><div className="flex items-center justify-between"><div><h2 className="font-semibold text-[#29445d]">Evidence included in report</h2><p className="mt-1 text-sm text-[#718496]">Uploaded photographs are shown here and embedded into the generated PDF/Word report.</p></div><ImageIcon size={20} className="text-[#1d5f8f]"/></div>{attachments.length===0?<p className="mt-5 text-sm text-[#718496]">No evidence uploaded.</p>:<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{attachments.map(a=>{const isImg=(a.content_type||a.file_type||"").startsWith("image/");const url=getAttachmentDownloadUrl(a.id);return <div key={a.id} className="overflow-hidden rounded-xl border border-[#d7e0e8] bg-[#f8fafb]">{isImg?<img src={url} alt={a.description||a.file_name} className="h-40 w-full object-contain bg-[#eef2f5]"/>:<div className="flex h-40 items-center justify-center"><FileText size={38} className="text-[#7d91a2]"/></div>}<div className="p-3"><p className="truncate text-sm font-semibold text-[#3d566c]">{a.file_name}</p><p className="mt-1 text-xs text-[#748697]">{a.description||"Supporting evidence"}</p><a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1d5f8f]"><Download size={13}/>Open</a></div></div>})}</div>}</Card>
  <ReportHistory reports={reports}/>
  <Card className={summary.result==="FAIL"?"border-[#e7c5c1] bg-[#fff8f7]":summary.result==="PASS"?"border-[#bfe0cd] bg-[#f7fcf9]":"border-[#ead7aa] bg-[#fffaf0]"}><div className="flex items-start gap-3">{summary.result==="FAIL"?<XCircle className="text-[#b33b31]"/>:summary.result==="PASS"?<CheckCircle2 className="text-[#1d7545]"/>:<AlertTriangle className="text-[#9a6a14]"/>}<div><p className="font-semibold">{summary.result==="FAIL"?"NON-COMPLIANT":summary.result==="PASS"?"COMPLIANT":"INCOMPLETE"}</p><p className="mt-1 text-sm text-[#6a7d8f]">Report generation is not blocked by failed tests. Finalization remains a separate control.</p></div></div></Card>
 </div>;
}
