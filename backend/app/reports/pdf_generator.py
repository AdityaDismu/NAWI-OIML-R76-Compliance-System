from io import BytesIO
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether

NAVY = colors.HexColor("#173B59")
BLUE = colors.HexColor("#1D5F8F")
PALE = colors.HexColor("#EEF4F8")
GRID = colors.HexColor("#D5DEE6")
TEXT = colors.HexColor("#263B4E")
GREEN = colors.HexColor("#1D7545")
RED = colors.HexColor("#B33B31")
AMBER = colors.HexColor("#9A6A14")


def _esc(value):
    return str(value if value is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def _p(value, style): return Paragraph(_esc(value).replace("\n", "<br/>"), style)
def _app(v): return "APPLICABLE" if v is True else "NOT APPLICABLE"
def _result(test): return str(test.get("result") or "NOT TESTED").upper()

def _kv_table(rows, styles):
    data=[[Paragraph(f"<b>{_esc(k)}</b>", styles["cell"]), _p(v, styles["cell"])] for k,v in rows]
    t=Table(data, colWidths=[52*mm, 118*mm], repeatRows=0, hAlign="LEFT")
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),PALE),("GRID",(0,0),(-1,-1),0.45,GRID),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    return t

def _header_footer(canvas, doc):
    canvas.saveState(); w,h=A4
    canvas.setFillColor(NAVY); canvas.rect(0,h-11*mm,w,11*mm,fill=1,stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica-Bold",8); canvas.drawString(15*mm,h-7.2*mm,"NAWI · NON-AUTOMATIC WEIGHING INSTRUMENT")
    canvas.setFillColor(colors.HexColor("#6D7E8F")); canvas.setFont("Helvetica",7); canvas.drawString(15*mm,8*mm,"OIML R76 test & compliance record")
    canvas.drawRightString(w-15*mm,8*mm,f"Page {doc.page}"); canvas.restoreState()

def generate_pdf(report_data):
    buf=BytesIO(); doc=SimpleDocTemplate(buf,pagesize=A4,leftMargin=15*mm,rightMargin=15*mm,topMargin=18*mm,bottomMargin=15*mm,title="NAWI Test & Compliance Report",author="NAWI")
    base=getSampleStyleSheet(); styles={
      "title":ParagraphStyle("title",parent=base["Title"],fontName="Helvetica-Bold",fontSize=22,leading=26,textColor=NAVY,alignment=TA_CENTER,spaceAfter=5),
      "sub":ParagraphStyle("sub",parent=base["BodyText"],fontSize=9,textColor=colors.HexColor("#66788A"),alignment=TA_CENTER,spaceAfter=14),
      "h":ParagraphStyle("h",parent=base["Heading2"],fontName="Helvetica-Bold",fontSize=12,leading=15,textColor=NAVY,spaceBefore=8,spaceAfter=7),
      "h3":ParagraphStyle("h3",parent=base["Heading3"],fontName="Helvetica-Bold",fontSize=10,leading=13,textColor=NAVY,spaceBefore=8,spaceAfter=5),
      "cell":ParagraphStyle("cell",parent=base["BodyText"],fontSize=7.7,leading=10,textColor=TEXT),
      "small":ParagraphStyle("small",parent=base["BodyText"],fontSize=7,leading=9,textColor=colors.HexColor("#5F7182")),
      "center":ParagraphStyle("center",parent=base["BodyText"],fontSize=8,leading=10,textColor=TEXT,alignment=TA_CENTER),
    }
    ev=report_data["evaluation"]; inst=report_data["instrument"]; rng=report_data.get("instrument_range") or {}; tests=report_data.get("tests",[]); summary=report_data.get("summary",{}); attachments=report_data.get("attachments",[]); env=report_data.get("environment")
    elements=[Spacer(1,7*mm),Paragraph("NAWI",styles["title"]),Paragraph("NON-AUTOMATIC WEIGHING INSTRUMENT TEST & COMPLIANCE REPORT",styles["sub"])]
    overall=summary.get("overall_result","INCOMPLETE"); overall_color={"PASS":GREEN,"FAIL":RED,"INCOMPLETE":AMBER}.get(overall,AMBER)
    banner=Table([[Paragraph(f"<b>OVERALL RESULT · {overall}</b>",ParagraphStyle("result",parent=styles["center"],fontSize=12,textColor=colors.white))]],colWidths=[170*mm]); banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),overall_color),("BOX",(0,0),(-1,-1),0.6,overall_color),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)])); elements += [banner,Spacer(1,4*mm),_p(summary.get("overall_statement",""),styles["small"]),Spacer(1,4*mm)]
    elements += [Paragraph("1. Instrument identification",styles["h"]),_kv_table([
      ("Manufacturer",inst.get("manufacturer")),("Model / Type",inst.get("model") or inst.get("model_type")),("Serial Number",inst.get("serial_number")),("Accuracy Class",inst.get("accuracy_class")),("Instrument Category",inst.get("category")),("Indication Type",inst.get("indication_type")),("Software ID",inst.get("software_identification")),("Software Version",inst.get("software_version"))],styles),
      Spacer(1,4*mm),Paragraph("2. Capacity and scale information",styles["h"]),_kv_table([("Max",rng.get("max_capacity")),("Min",rng.get("min_capacity")),("Verification Scale Interval (e)",rng.get("verification_scale_interval")),("Actual Scale Interval (d)",rng.get("actual_scale_interval")),("Maximum Tare",rng.get("maximum_tare"))],styles),
      Spacer(1,4*mm),Paragraph("3. Evaluation information",styles["h"]),_kv_table([("Evaluation Type",ev.get("evaluation_type")),("Status",ev.get("status")),("Evaluation ID",ev.get("id")),("Notes",ev.get("notes") or "—")],styles)]
    if env: elements += [Spacer(1,4*mm),Paragraph("4. Test environment",styles["h"]),_kv_table([("Temperature",env.get("temperature")),("Humidity",env.get("humidity")),("Pressure",env.get("pressure")),("Location",env.get("location")),("Conditions acceptable",env.get("conditions_ok"))],styles)]
    elements += [Spacer(1,4*mm),Paragraph("5. Compliance summary",styles["h"])]
    sm=[[Paragraph("Metric",styles["cell"]),Paragraph("Value",styles["cell"])]]+[[Paragraph(_esc(k),styles["cell"]),Paragraph(_esc(v),styles["cell"])] for k,v in [("Applicable tests",summary.get("applicable_tests",0)), ("Completed tests",summary.get("completed_tests",0)), ("Passed tests",summary.get("passed_tests",0)), ("Failed tests",summary.get("failed_tests",0)), ("Not tested",summary.get("not_tested_tests",0)), ("Not applicable",summary.get("not_applicable_tests",0))]]
    st=Table(sm,colWidths=[125*mm,45*mm],repeatRows=1); st.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),PALE),("GRID",(0,0),(-1,-1),0.45,GRID),("VALIGN",(0,0),(-1,-1),"TOP"),("PADDING",(0,0),(-1,-1),5)])); elements += [st,Spacer(1,5*mm),Paragraph("6. Test result matrix",styles["h"])]
    data=[[Paragraph("#",styles["cell"]),Paragraph("Test",styles["cell"]),Paragraph("Applicability",styles["cell"]),Paragraph("Status",styles["cell"]),Paragraph("Result",styles["cell"])]]
    for i,t in enumerate(tests,1):
      r=_result(t); rc=GREEN if r=="PASS" else RED if r=="FAIL" else AMBER
      data.append([_p(i,styles["center"]),_p(t.get("test_name") or t.get("test_code"),styles["cell"]),_p(_app(t.get("applicability")),styles["cell"]),_p(t.get("status"),styles["cell"]),Paragraph(f'<b><font color="{rc.hexval()}">{_esc(r)}</font></b>',styles["cell"])])
    mt=Table(data,colWidths=[9*mm,73*mm,30*mm,29*mm,29*mm],repeatRows=1,splitByRow=1); mt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),0.4,GRID),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)])); elements.append(mt)
    elements += [PageBreak(),Paragraph("7. Detailed test results",styles["h"])]
    for t in tests:
      elements.append(Paragraph(_esc(t.get("test_name") or t.get("test_code")),styles["h3"]))
      r=_result(t); rc=GREEN if r=="PASS" else RED if r=="FAIL" else AMBER
      head=Table([[Paragraph(f"<b>{_esc(_app(t.get('applicability')))} · {r}</b>",styles["cell"]) ]],colWidths=[170*mm]); head.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#F6F8FA")),("BOX",(0,0),(-1,-1),0.4,GRID),("TEXTCOLOR",(0,0),(-1,-1),rc),("PADDING",(0,0),(-1,-1),5)])); elements.append(head)
      if t.get("applicability_reason"): elements.append(_p("Applicability reason: "+str(t["applicability_reason"]),styles["small"]))
      if t.get("criterion"): elements.append(_p("Criterion: "+str(t["criterion"]),styles["small"]))
      if t.get("explanation"): elements.append(_p("Explanation: "+str(t["explanation"]),styles["small"]))
      if t.get("remarks"): elements.append(_p("Remarks: "+str(t["remarks"]),styles["small"]))
      details=t.get("details") or {}; obs=details.get("observations") if isinstance(details,dict) else None
      if isinstance(obs,list) and obs:
        od=[[Paragraph("#",styles["cell"]),Paragraph("Recorded observation",styles["cell"])]]
        for j,o in enumerate(obs,1): od.append([_p(j,styles["center"]),_p(o if isinstance(o,str) else "\n".join(f"{k}: {v}" for k,v in o.items()),styles["cell"])])
        ot=Table(od,colWidths=[9*mm,161*mm],repeatRows=1,splitByRow=1); ot.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),PALE),("GRID",(0,0),(-1,-1),0.35,GRID),("VALIGN",(0,0),(-1,-1),"TOP"),("PADDING",(0,0),(-1,-1),4)])); elements += [Spacer(1,2*mm),ot]
      elements.append(Spacer(1,4*mm))
    if attachments:
      elements += [PageBreak(),Paragraph("8. Evidence and supporting records",styles["h"])]
      image_items=[a for a in attachments if a.get("is_image") and a.get("local_exists")]
      file_items=[a for a in attachments if not (a.get("is_image") and a.get("local_exists"))]
      for a in file_items:
        elements.append(_p(f"{a.get('file_name')} — {a.get('description') or 'Supporting document'}",styles["small"]))
      if image_items:
        for idx,a in enumerate(image_items,1):
          try:
            img=Image(a["file_path"],width=78*mm,height=58*mm); img.hAlign="CENTER"
            cap=Paragraph(f"Figure {idx} — {_esc(a.get('description') or a.get('file_name'))}",styles["small"])
            elements += [Spacer(1,3*mm),KeepTogether([img,cap])]
          except Exception:
            pass
    elements += [Spacer(1,5*mm),Paragraph("9. Final statement",styles["h"]),_p("This report records the observations, calculations and outcomes stored for the evaluation. Failed tests are retained and explicitly identified; a failed test does not prevent report generation. The overall compliance result is determined from the applicable test outcomes shown in this report.",styles["small"])]
    doc.build(elements,onFirstPage=_header_footer,onLaterPages=_header_footer); buf.seek(0); return buf
