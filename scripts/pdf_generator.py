import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime
import logging

# Set up logging
logger = logging.getLogger(__name__)

def generate_fir_pdf(fir_data):
    """Generate FIR PDF in official structured format with proper error handling"""
    try:
        fir_number = fir_data.get('fir_number', 'UNKNOWN')
        logger.info(f"📄 Starting PDF generation for FIR: {fir_number}")
        
        # Validate required data
        if not fir_number or fir_number == 'UNKNOWN':
            logger.error("❌ Invalid FIR number provided")
            return None
        
        # Directory setup with proper error handling
        try:
            parts = fir_number.split('/')
            if len(parts) < 4:
                logger.error(f"❌ Invalid FIR number format: {fir_number}")
                return None
                
            year = parts[1]
            month = int(parts[2])
            month_name = datetime(2000, month, 1).strftime('%B')

            dir_path = f"fir_drafts/{year}/{month:02d}_{month_name}"
            os.makedirs(dir_path, exist_ok=True)
            logger.info(f"✅ Created directory: {dir_path}")

            filename = f"{fir_number.replace('/', '_')}.pdf"
            filepath = os.path.join(dir_path, filename)
            
        except Exception as dir_error:
            logger.error(f"❌ Directory creation failed: {dir_error}")
            return None

        # Create Document
        try:
            doc = SimpleDocTemplate(
                filepath,
                pagesize=A4,
                rightMargin=40,
                leftMargin=40,
                topMargin=40,
                bottomMargin=40
            )

            styles = getSampleStyleSheet()

            # Custom Styles
            title_style = ParagraphStyle(
                'FIRTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor('#0d47a1'),
                alignment=1,
                spaceAfter=20
            )

            header_style = ParagraphStyle(
                'Header',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.HexColor('#b71c1c'),
                spaceBefore=10,
                spaceAfter=8,
                underlineWidth=1
            )

            content_style = ParagraphStyle(
                'Content',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=6
            )

            description_style = ParagraphStyle(
                'Description',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=12,
                backColor=colors.HexColor('#f8f9fa'),
                borderPadding=8,
                borderColor=colors.HexColor('#dee2e6'),
                borderWidth=1
            )

            story = []

            # Optional: Add Police Logo (if available)
            logo_path = "static/logo.png"
            if os.path.exists(logo_path):
                try:
                    logo = Image(logo_path, width=60, height=60)
                    logo.hAlign = 'CENTER'
                    story.append(logo)
                    story.append(Spacer(1, 10))
                except Exception as logo_error:
                    logger.warning(f"⚠️ Could not load logo: {logo_error}")

            # Title
            story.append(Paragraph("<b>FIRST INFORMATION REPORT (FIR)</b>", title_style))
            story.append(Spacer(1, 10))

            # === FIR Header Info ===
            fir_info = [
                ["FIR Number", fir_data.get('fir_number', 'N/A')],
                ["Date & Time", datetime.now().strftime("%d/%m/%Y %H:%M")],
                ["Police Station", fir_data.get('police_station', 'N/A')],
                ["District", fir_data.get('district', 'N/A')],
                ["State", fir_data.get('state', 'N/A')]
            ]

            fir_table = Table(fir_info, colWidths=[120, 350])
            fir_table.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(fir_table)
            story.append(Spacer(1, 15))

            # === INCIDENT DETAILS ===
            story.append(Paragraph("INCIDENT DETAILS", header_style))

            inc = fir_data.get('incident_details', {})
            if not inc:
                logger.warning("⚠️ No incident details found in FIR data")

            # Table part (without description)
            incident_data = [
                ["Type of Incident", inc.get('type', 'N/A')],
                ["Date of Incident", inc.get('date', 'N/A')],
                ["Time of Incident", inc.get('time', 'N/A')],
                ["Location", inc.get('location', 'N/A')],
            ]

            incident_table = Table(incident_data, colWidths=[120, 350])
            incident_table.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(incident_table)
            story.append(Spacer(1, 5))

            # Description as a separate paragraph block
            story.append(Paragraph("<b>Description:</b>", content_style))
            incident_desc = inc.get('description', 'No description provided')
            story.append(Paragraph(incident_desc, description_style))
            story.append(Spacer(1, 15))

            # === VICTIM INFORMATION ===
            story.append(Paragraph("VICTIM INFORMATION", header_style))
            vic = fir_data.get('victim_info', {})
            victim_data = [
                ["Name", vic.get('name', 'N/A')],
                ["Contact", vic.get('contact', 'N/A')],
                ["Address", vic.get('address', 'N/A')],
                ["Age", str(vic.get('age', 'N/A'))],
                ["Gender", vic.get('gender', 'N/A')],
            ]

            victim_table = Table(victim_data, colWidths=[120, 350])
            victim_table.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(victim_table)
            story.append(Spacer(1, 15))

            # === ACCUSED INFO ===
            acc = fir_data.get('accused_info', {})
            if acc.get('name'):
                story.append(Paragraph("ACCUSED INFORMATION", header_style))
                accused_data = [
                    ["Name", acc.get('name', 'N/A')],
                    ["Description", acc.get('description', 'N/A')],
                ]
                accused_table = Table(accused_data, colWidths=[120, 350])
                accused_table.setStyle(TableStyle([
                    ('BOX', (0, 0), (-1, -1), 1, colors.black),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(accused_table)
                story.append(Spacer(1, 15))

            # === LEGAL SECTIONS ===
            story.append(Paragraph("LEGAL SECTIONS APPLIED", header_style))
            sections_applied = fir_data.get('sections_applied', [])
            if sections_applied:
                sections = [
                    [f"IPC Section {s.get('section_number', 'N/A')}: {s.get('section_title', 'N/A')}"]
                    for s in sections_applied
                ]
                sec_table = Table(sections, colWidths=[470])
                sec_table.setStyle(TableStyle([
                    ('BOX', (0, 0), (-1, -1), 1, colors.black),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(sec_table)
            else:
                story.append(Paragraph("No specific sections applied", content_style))

            story.append(Spacer(1, 15))

            # === OFFICER INFO ===
            story.append(Paragraph("INVESTIGATING OFFICER", header_style))
            story.append(Paragraph(fir_data.get('investigating_officer', 'N/A'), content_style))
            story.append(Spacer(1, 25))

            # === ADDITIONAL COMMENTS ===
            additional_comments = fir_data.get('additional_comments', '')
            if additional_comments:
                story.append(Paragraph("ADDITIONAL COMMENTS", header_style))
                story.append(Paragraph(additional_comments, description_style))
                story.append(Spacer(1, 15))

            # === SIGNATURE AREA ===
            story.append(Spacer(1, 20))
            story.append(Paragraph("<b>Signature of Officer:</b> ____________________________", content_style))
            story.append(Spacer(1, 10))
            story.append(Paragraph("<b>Date:</b> ____________________________", content_style))

            # Build PDF
            doc.build(story)
            
            # Verify PDF was created
            if os.path.exists(filepath):
                logger.info(f"✅ PDF generated successfully: {filepath}")
                return filepath
            else:
                logger.error(f"❌ PDF file was not created: {filepath}")
                return None

        except Exception as pdf_error:
            logger.error(f"💥 PDF generation failed for {fir_number}: {str(pdf_error)}")
            return None

    except Exception as e:
        logger.error(f"💥 Fatal error in generate_fir_pdf: {str(e)}")
        return None
