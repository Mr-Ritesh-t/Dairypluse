"""
DairyPulse Automated PDF Invoice Generator
Uses ReportLab to generate professional, tax-compliant milk invoices.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

TEAL = colors.HexColor("#0F766E")
TEAL_LIGHT = colors.HexColor("#F0FDFA")
SLATE_DARK = colors.HexColor("#0F172A")
SLATE_MED = colors.HexColor("#475569")
SLATE_LIGHT = colors.HexColor("#94A3B8")
WHITE = colors.white
EMERALD = colors.HexColor("#059669")
AMBER = colors.HexColor("#D97706")
ROSE = colors.HexColor("#E11D48")

def generate_invoice_pdf(invoice, customer, dairy=None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "InvTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=TEAL,
        leading=22,
    )
    dairy_sub = ParagraphStyle(
        "DairySub",
        fontName="Helvetica",
        fontSize=9,
        textColor=SLATE_MED,
        leading=13,
    )
    h2_style = ParagraphStyle(
        "InvH2",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=SLATE_DARK,
        leading=15,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "InvBody",
        fontName="Helvetica",
        fontSize=9,
        textColor=SLATE_DARK,
        leading=13,
    )
    body_bold = ParagraphStyle(
        "InvBodyBold",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=SLATE_DARK,
        leading=13,
    )
    cell_right = ParagraphStyle(
        "CellRight",
        fontName="Helvetica",
        fontSize=9,
        textColor=SLATE_DARK,
        alignment=TA_RIGHT,
        leading=13,
    )
    cell_right_bold = ParagraphStyle(
        "CellRightBold",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=SLATE_DARK,
        alignment=TA_RIGHT,
        leading=13,
    )
    table_hdr = ParagraphStyle(
        "TableHdr",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=12,
    )
    table_cell = ParagraphStyle(
        "TableCell",
        fontName="Helvetica",
        fontSize=9,
        textColor=SLATE_DARK,
        leading=12,
    )

    story = []

    # 1. Header Block: Dairy Branding & Invoice Title
    dairy_name = dairy.name if dairy else (invoice.dairy_name or "Amrut Dairy Farm")
    dairy_phone = dairy.phone if dairy else "+91 98220 12345"
    dairy_email = dairy.email if dairy else "billing@amrutdairy.in"
    dairy_city = dairy.city if dairy else "Pune, Maharashtra"
    dairy_upi = getattr(dairy, "upi_id", "amrutdairy@okhdfcbank") if dairy else "amrutdairy@okhdfcbank"

    status_str = (invoice.status or "PENDING").upper()
    status_bg = EMERALD if status_str == "PAID" else (AMBER if status_str == "PARTIAL" else ROSE)

    header_data = [
        [
            Paragraph(f"<b>{dairy_name}</b>", title_style),
            Paragraph(f"<b>TAX INVOICE</b><br/><font size=8 color='#64748B'>#{invoice.invoice_number}</font>", ParagraphStyle("RightHdr", fontName="Helvetica-Bold", fontSize=14, textColor=SLATE_DARK, alignment=TA_RIGHT, leading=18))
        ],
        [
            Paragraph(f"FSSAI Lic. No: 11522036000124 | GSTIN: 27AABCA1234F1Z5<br/>Phone: {dairy_phone} | Email: {dairy_email}<br/>Location: {dairy_city}", dairy_sub),
            Paragraph(f"<font color='{status_bg.hexval()}'><b>● STATUS: {status_str}</b></font><br/>Billing Period: <b>{invoice.billing_period}</b>", ParagraphStyle("RightSub", fontName="Helvetica", fontSize=9, textColor=SLATE_DARK, alignment=TA_RIGHT, leading=14))
        ]
    ]
    hdr_tbl = Table(header_data, colWidths=[10 * cm, 6 * cm])
    hdr_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(hdr_tbl)
    story.append(Spacer(1, 0.4 * cm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceAfter=10))

    # 2. Bill To & Invoice Meta
    cust_name = customer.name if customer else invoice.customer_name
    cust_phone = customer.phone if customer else "N/A"
    cust_address = customer.address if customer else "Registered Address"
    cust_route = customer.route if customer else "Standard Route"
    cust_area = customer.area if customer else "Pune"

    meta_data = [
        [
            Paragraph("<b>BILLED TO:</b>", h2_style),
            Paragraph("<b>INVOICE DETAILS:</b>", h2_style)
        ],
        [
            Paragraph(f"<b>{cust_name}</b><br/>Phone: {cust_phone}<br/>Address: {cust_address}<br/>Route: {cust_route} ({cust_area})", body_style),
            Paragraph(f"Invoice Date: <b>{invoice.issue_date or datetime.now().strftime('%Y-%m-%d')}</b><br/>Due Date: <b>{invoice.due_date or '10th of Month'}</b><br/>Customer ID: <b>{invoice.customer_id}</b><br/>Payment Mode: <b>UPI / Cash / Bank</b>", body_style)
        ]
    ]
    meta_tbl = Table(meta_data, colWidths=[10 * cm, 6 * cm])
    meta_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), TEAL_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCFBF1")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 0.5 * cm))

    # 3. Itemized Deliveries & Charges
    items_header = [
        Paragraph("Sr.", table_hdr),
        Paragraph("Description / Milk Product", table_hdr),
        Paragraph("Billing Cycle", table_hdr),
        Paragraph("Qty (Liters)", table_hdr),
        Paragraph("Rate / L", table_hdr),
        Paragraph("Amount (INR)", table_hdr),
    ]

    tot_amt = float(invoice.total_amount or 0.0)
    paid_amt = float(invoice.paid_amount or 0.0)
    bal_due = max(0.0, tot_amt - paid_amt)

    # Estimate volume and rate from total
    est_qty = round(tot_amt / 65.0, 1) if tot_amt > 0 else 30.0
    est_rate = round(tot_amt / est_qty, 2) if est_qty > 0 else 65.0

    items_rows = [
        items_header,
        [
            Paragraph("1", table_cell),
            Paragraph("<b>Fresh Farm Milk Daily Doorstep Supply</b><br/><font size=7 color='#64748B'>Chilled Cold-Chain A2 / Standard Milk Deliveries</font>", table_cell),
            Paragraph(f"{invoice.billing_period}", table_cell),
            Paragraph(f"{est_qty} L", ParagraphStyle("CQty", parent=table_cell, alignment=TA_CENTER)),
            Paragraph(f"Rs. {est_rate:.2f}", ParagraphStyle("CRate", parent=table_cell, alignment=TA_RIGHT)),
            Paragraph(f"Rs. {tot_amt:.2f}", ParagraphStyle("CAmt", parent=table_cell, alignment=TA_RIGHT)),
        ],
    ]

    # If customer has unreturned bottles, add line item notice
    bottle_bal = getattr(customer, "bottle_balance", 0) if customer else 0
    if bottle_bal and bottle_bal > 0:
        deposit_rate = getattr(customer, "bottle_deposit_rate", 50.0) if customer else 50.0
        items_rows.append([
            Paragraph("2", table_cell),
            Paragraph(f"<b>Glass Bottle Security Deposit Ledger</b><br/><font size=7 color='#64748B'>{bottle_bal} bottles currently held by customer (Deposit: Rs. {deposit_rate:.0f}/ea)</font>", table_cell),
            Paragraph("Held Status", table_cell),
            Paragraph(f"{bottle_bal} Units", ParagraphStyle("CQty", parent=table_cell, alignment=TA_CENTER)),
            Paragraph("Deposit", ParagraphStyle("CRate", parent=table_cell, alignment=TA_RIGHT)),
            Paragraph(f"[Rs. {bottle_bal * deposit_rate:.0f} Held]", ParagraphStyle("CAmt", parent=table_cell, alignment=TA_RIGHT)),
        ])

    items_tbl = Table(items_rows, colWidths=[1.2 * cm, 6.8 * cm, 2.5 * cm, 2.0 * cm, 2.0 * cm, 2.5 * cm])
    items_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(items_tbl)
    story.append(Spacer(1, 0.4 * cm))

    # 4. Totals & Payment Summary
    totals_data = [
        [
            Paragraph("<b>Payment Instructions:</b><br/>"
                      f"• Instant UPI VPA: <b>{dairy_upi}</b><br/>"
                      f"• Bank Name: HDFC Bank, Aundh Branch<br/>"
                      f"• Account: 50200012345678 | IFSC: HDFC0001234<br/>"
                      f"• Or scan UPI QR directly on rider's mobile device upon morning drop.<br/>"
                      f"<font color='#059669'>Thank you for supporting pure, local farm milk!</font>", body_style),
            Table([
                [Paragraph("Subtotal:", body_style), Paragraph(f"Rs. {tot_amt:.2f}", cell_right)],
                [Paragraph("Paid Amount:", body_style), Paragraph(f"Rs. {paid_amt:.2f}", cell_right)],
                [Paragraph("<b>Balance Due:</b>", body_bold), Paragraph(f"<b>Rs. {bal_due:.2f}</b>", cell_right_bold)],
            ], colWidths=[3.2 * cm, 2.8 * cm])
        ]
    ]
    totals_tbl = Table(totals_data, colWidths=[10 * cm, 6 * cm])
    totals_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (1, 0), (1, 0), TEAL_LIGHT),
        ("BOX", (1, 0), (1, 0), 1, TEAL),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(totals_tbl)
    story.append(Spacer(1, 0.8 * cm))

    # 5. Footer Sign-off
    footer_data = [
        [
            Paragraph("<b>Terms & Conditions:</b><br/>1. Subscriptions pause requests must be made before 10:00 PM for next morning.<br/>2. Discrepancies must be reported within 48 hours via DairyPulse app.<br/>3. Payment due within 7 days of invoice issue.", ParagraphStyle("FootTerms", fontName="Helvetica", fontSize=7.5, textColor=SLATE_LIGHT, leading=10)),
            Paragraph("For <b>" + dairy_name + "</b><br/><br/><br/>________________________<br/><b>Authorized Signatory</b>", ParagraphStyle("SignStyle", fontName="Helvetica", fontSize=8, textColor=SLATE_DARK, alignment=TA_CENTER, leading=12))
        ]
    ]
    foot_tbl = Table(footer_data, colWidths=[10.5 * cm, 5.5 * cm])
    foot_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
    ]))
    story.append(foot_tbl)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
