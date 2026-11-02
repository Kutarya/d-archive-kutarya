"""Türkçe okul tablolarını kaynak Markdown'dan okunaklı PDF'e dönüştürür."""
from pathlib import Path
from html import escape
import re
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4, landscape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "artifacts/kutarya-cep/Kutarya-Cep-Okul-Dosyasi-1.0.0.pdf"
pdfmetrics.registerFont(TTFont("School", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("SchoolBold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFontFamily("School", normal="School", bold="SchoolBold", italic="School", boldItalic="SchoolBold")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle("BodyTR", fontName="School", fontSize=10, leading=15, spaceAfter=9, textColor=colors.HexColor("#24243A")))
styles.add(ParagraphStyle("TitleTR", fontName="SchoolBold", fontSize=27, leading=34, spaceAfter=18, textColor=colors.HexColor("#6958E8")))
styles.add(ParagraphStyle("HeadingTR", fontName="SchoolBold", fontSize=17, leading=23, spaceAfter=12, spaceBefore=8, textColor=colors.HexColor("#24243A")))
styles.add(ParagraphStyle("CellTR", fontName="School", fontSize=8, leading=11, textColor=colors.HexColor("#24243A")))
styles.add(ParagraphStyle("HeaderTR", fontName="SchoolBold", fontSize=8, leading=11, textColor=colors.white))

def markup(text):
    text = escape(text.replace("–", "-").replace("—", "-"))
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text

def footer(c, doc):
    c.setStrokeColor(colors.HexColor("#E6E6F0")); c.line(32, 31, doc.pagesize[0]-32, 31)
    c.setFont("School", 8); c.setFillColor(colors.HexColor("#73778F")); c.drawString(32, 19, "KUTARYA CEP  /  OKUL PROJESİ  /  5 EKİM 2026")
    c.drawRightString(doc.pagesize[0]-32, 19, str(doc.page))

source = (ROOT / "mobile-src/kutarya-cep/docs/OKUL-PROJESI.md").read_text(encoding="utf-8").splitlines()
story=[];i=0
while i<len(source):
    line=source[i].strip()
    if not line: i+=1;continue
    if line.startswith("# "):story.append(Paragraph(markup(line[2:]),styles["TitleTR"]));i+=1;continue
    if line.startswith("## "):
        if "zaman dağılım" in line or "Risk analiz" in line or "OOP ve" in line:story.append(PageBreak())
        story.append(Paragraph(markup(line[3:]),styles["HeadingTR"]));i+=1;continue
    if line.startswith("|"):
        rows=[]
        while i<len(source) and source[i].strip().startswith("|"):
            cells=[v.strip() for v in source[i].strip().strip("|").split("|")]
            if not all(re.fullmatch(r"[-: ]+",v) for v in cells):rows.append(cells)
            i+=1
        widths=[205,75,60,55,380] if len(rows[0])==5 else [30,150,22,22,35,290,38,188]
        available=landscape(A4)[0]-64;factor=available/sum(widths);widths=[v*factor for v in widths]
        data=[[Paragraph(markup(v),styles["HeaderTR" if r==0 else "CellTR"]) for v in row] for r,row in enumerate(rows)]
        table=Table(data,colWidths=widths,repeatRows=1,hAlign="LEFT")
        padding=5 if len(rows[0])==8 else 7
        table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#6958E8")),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.HexColor("#F6F5FC"),colors.white]),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),padding),("BOTTOMPADDING",(0,0),(-1,-1),padding),("LINEBELOW",(0,0),(-1,0),0.5,colors.HexColor("#6958E8"))]))
        story.extend([table,Spacer(1,14)]);continue
    story.append(Paragraph(markup(line),styles["BodyTR"]));i+=1
OUT.parent.mkdir(parents=True,exist_ok=True)
doc=SimpleDocTemplate(str(OUT),pagesize=landscape(A4),leftMargin=32,rightMargin=32,topMargin=30,bottomMargin=44,title="Kutarya Cep - Okul Proje Dosyası",author="Kutarya")
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
