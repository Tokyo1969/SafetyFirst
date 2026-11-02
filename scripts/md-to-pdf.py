# Regulamin (src/content/regulamin.md) do PDF dla maili z potwierdzeniem zamowienia (site.legal.regulaminPdf).
# Uzycie: python scripts/md-to-pdf.py src/content/regulamin.md public/dokumenty/regulamin-RRRR-MM-DD.pdf "Regulamin sklepu Safety First, wersja z ..."
# Wymaga reportlab i czcionki Arial (Windows). Stare wersje PDF zostawiamy: sa linkowane w wyslanych mailach.
import re, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem

src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
ink = HexColor('#1D2B3E')
body = ParagraphStyle('b', fontName='Arial', fontSize=9.5, leading=13.5, textColor=ink, spaceAfter=4)
h1 = ParagraphStyle('h1', parent=body, fontName='Arial-Bold', fontSize=16, leading=20, spaceAfter=6)
h2 = ParagraphStyle('h2', parent=body, fontName='Arial-Bold', fontSize=11.5, leading=15, spaceBefore=10, spaceAfter=4)

def inline(t):
    t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    t = t.replace(r'\*', '*').replace(r'\[', '[').replace(r'\]', ']')
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'`(.+?)`', r'\1', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1 (\2)', t)
    return t

story, items, kind = [], [], None
def flush():
    global items, kind
    if items:
        story.append(ListFlowable([ListItem(Paragraph(inline(i), body), leftIndent=14) for i in items],
            bulletType='1' if kind == 'ol' else 'bullet', start=1, leftIndent=14, bulletFontName='Arial', bulletFontSize=9.5))
    items, kind = [], None

for raw in open(src, encoding='utf-8').read().splitlines():
    line = raw.rstrip()
    m_ol = re.match(r'^\d+\.\s+(.*)', line)
    m_ul = re.match(r'^\s*-\s+(.*)', line)
    if line.startswith('# '):
        flush(); story.append(Paragraph(inline(line[2:]), h1))
    elif line.startswith('## '):
        flush(); story.append(Paragraph(inline(line[3:]), h2))
    elif m_ol:
        if kind not in (None, 'ol'): flush()
        kind = 'ol'; items.append(m_ol.group(1))
    elif m_ul and kind == 'ol' and raw.startswith('   '):
        items[-1] += '<br/>– ' + m_ul.group(1)
    elif m_ul:
        if kind not in (None, 'ul'): flush()
        kind = 'ul'; items.append(m_ul.group(1))
    elif not line:
        flush()
    else:
        flush(); story.append(Paragraph(inline(line), body))
flush()

def footer(c, d):
    c.setFont('Arial', 8); c.setFillColor(ink)
    c.drawString(18*mm, 10*mm, title)
    c.drawRightString(A4[0]-18*mm, 10*mm, f'Strona {d.page}')

doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=18*mm,
    title=title, author='Natalia Krysztofiak (Safety First)')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print('ok', out)
