import { FileText, Image, Download, Trash2, ExternalLink } from "lucide-react";
import { getAttachmentDownloadUrl } from "../../api/attachments";

export default function EvidenceItem({ attachment, onDelete }) {
  const fileName = attachment.file_name || attachment.filename || attachment.name || "Evidence file";
  const description = attachment.description || "Supporting evidence";
  const fileType = attachment.file_type || attachment.mime_type || attachment.content_type || "";
  const isImage = fileType.startsWith("image/");
  const url = getAttachmentDownloadUrl(attachment.id);
  return <div className="overflow-hidden rounded-xl border border-[#d7e0e8] bg-white shadow-sm">
    {isImage ? <a href={url} target="_blank" rel="noreferrer" className="block bg-[#f3f6f8] p-2"><img src={url} alt={description} className="h-44 w-full rounded-lg object-contain" /></a> : <div className="flex h-44 items-center justify-center bg-[#f3f6f8]"><FileText size={42} className="text-[#7890a3]" /></div>}
    <div className="p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-[#edf4f8] p-2 text-[#1d5f8f]">{isImage?<Image size={18}/>:<FileText size={18}/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#29445d]">{fileName}</p><p className="mt-1 text-xs leading-5 text-[#748697]">{description}</p></div></div><div className="mt-4 flex gap-2 border-t border-[#e5eaee] pt-3"><a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#1d5f8f] hover:bg-[#f1f5f8]">{isImage?<ExternalLink size={14}/>:<Download size={14}/>} {isImage?"Open image":"Download"}</a><button type="button" onClick={()=>onDelete(attachment.id)} className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#b33b31] hover:bg-[#fff1ef]"><Trash2 size={14}/>Delete</button></div></div>
  </div>;
}
