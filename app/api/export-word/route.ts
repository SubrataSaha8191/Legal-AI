import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.results) {
      return NextResponse.json({ error: 'No analysis results provided' }, { status: 400 });
    }

    const { results } = data;

  const ACCENT = '2F80ED';
  const LIGHT = 'EAF2FD';
  const ZEBRA = 'F5F9FE';

    const divider = new Paragraph({
      border: {
        bottom: { color: ACCENT, size: 8, style: BorderStyle.SINGLE },
      },
      spacing: { before: 120, after: 240 },
    });

    const labelCell = (text: string) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text, bold: true })],
          }),
        ],
        shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
      });

    const valueCell = (text: string, zebra?: boolean) =>
      new TableCell({
        children: [new Paragraph(String(text ?? ''))],
        shading: zebra ? { type: ShadingType.CLEAR, fill: ZEBRA, color: 'auto' } : undefined,
      });

    const keyValueTable = (rows: Array<[string, string | number]>) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map(([k, v], i) =>
          new TableRow({ children: [labelCell(k), valueCell(String(v ?? ''), i % 2 === 0)] })
        ),
      });

    const twoColTextTable = (leftTitle: string, leftText: string, rightTitle: string, rightText: string) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: leftTitle, bold: true })] })],
                shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: rightTitle, bold: true })] })],
                shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(String(leftText || ''))], shading: { type: ShadingType.CLEAR, fill: ZEBRA, color: 'auto' } }),
              new TableCell({ children: [new Paragraph(String(rightText || ''))] }),
            ],
          }),
        ],
      });

    // Create Word document
    const doc = new Document({
      creator: 'Legal Analyzer',
      title: 'Legal Document Analysis Report',
      styles: {
        default: {
          document: {
            run: { font: 'Calibri', size: 22 }, // 11pt
            paragraph: { spacing: { line: 276 } }, // 1.15
          },
          heading1: {
            run: { color: ACCENT, bold: true, size: 32 },
            paragraph: { spacing: { before: 360, after: 180 } },
          },
          heading2: {
            run: { bold: true, size: 26 },
            paragraph: { spacing: { before: 240, after: 120 } },
          },
        },
      },
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Legal Document Analysis Report', bold: true, color: ACCENT }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun('Page '),
                    new TextRun({ children: [PageNumber.CURRENT] }),
                  ],
                }),
              ],
            }),
          },
          properties: {
            page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }, // 1-inch
          },
          children: [
            // Title Block
            new Paragraph({
              text: 'Legal Document Analysis Report',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Comprehensive AI-Powered Review', italics: true, color: ACCENT }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            divider,

            // Document Overview
            new Paragraph({ text: 'DOCUMENT OVERVIEW', heading: HeadingLevel.HEADING_1 }),
            keyValueTable([
              ['Document Type', results.summary?.document_type || 'Unknown'],
              ['Pages', String(results.document_info?.pages ?? '0')],
              ['Total Words', String(results.document_info?.total_words?.toLocaleString?.() || results.document_info?.total_words || '0')],
              ['Clauses Found', String(results.clauses?.total_found ?? '0')],
            ]),

            divider,

            // Classification
            new Paragraph({ text: 'DOCUMENT CLASSIFICATION', heading: HeadingLevel.HEADING_1 }),
            keyValueTable([
              ['Primary Classification', results.classification?.primary_classification || 'Unknown'],
              ['Confidence', `${results.classification?.confidence_score || 0} keyword matches`],
            ]),
            new Paragraph({ text: 'Detected Keywords', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [labelCell('Keyword'), labelCell('Count')],
                }),
                ...((results.classification?.detected_keywords || []).map((k: any, i: number) =>
                  new TableRow({
                    children: [valueCell(k.keyword, i % 2 === 0), valueCell(String(k.count), i % 2 === 0)],
                  })
                )),
              ],
            }),

            divider,

            // Key Clauses
            new Paragraph({ text: 'KEY CLAUSES ANALYSIS', heading: HeadingLevel.HEADING_1 }),
            ...((results.summary?.key_clauses || []).flatMap((clause: any, index: number) => [
              new Paragraph({ text: `Clause ${index + 1}: ${clause.type}`, heading: HeadingLevel.HEADING_2 }),
              keyValueTable([
                ['Word Count', String(clause.word_count ?? '0')],
                ['Complexity Reduction', `${clause.complexity_reduction || 0}%`],
              ]),
              twoColTextTable('Original Text', clause.original || clause.text || '', 'Simplified Text', clause.simplified || ''),
            ])),

            divider,

            // Entities
            new Paragraph({ text: 'LEGAL ENTITIES IDENTIFIED', heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: 'Persons', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [labelCell('Name'), labelCell('Confidence')] }),
                ...((results.entities?.persons || []).map((p: any, i: number) =>
                  new TableRow({
                    children: [valueCell(p.text, i % 2 === 0), valueCell(`${(p.confidence * 100).toFixed(1)}%`, i % 2 === 0)],
                  })
                )),
              ],
            }),
            new Paragraph({ text: 'Important Dates', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [labelCell('Date')] }),
                ...((results.entities?.dates || []).length > 0
                  ? (results.entities?.dates || []).map((d: any, i: number) =>
                      new TableRow({ children: [valueCell(typeof d === 'string' ? d : (d?.text || String(d)), i % 2 === 0)] })
                    )
                  : [new TableRow({ children: [valueCell('None found')] })]
                ),
              ],
            }),

            divider,

            // All Clauses
            new Paragraph({ text: 'COMPLETE CLAUSE ANALYSIS', heading: HeadingLevel.HEADING_1 }),
            ...((results.clauses?.detailed_analysis || []).flatMap((clause: any) => [
              new Paragraph({ text: `Clause ${clause.id}: ${clause.type}`, heading: HeadingLevel.HEADING_2 }),
              keyValueTable([
                ['Word Count', String(clause.word_count ?? '0')],
                ['Character Count', String(clause.char_count ?? '0')],
                ['Complexity Reduction', `${clause.complexity_reduction || 0}%`],
              ]),
              twoColTextTable('Original Text', clause.original || clause.text || '', 'Simplified Text', clause.simplified || ''),
              new Paragraph({
                border: { bottom: { color: LIGHT, size: 4, style: BorderStyle.SINGLE } },
                spacing: { after: 120, before: 120 },
              }),
            ])),
          ],
        },
      ],
    });

    // Generate the Word document buffer
    const buffer = await Packer.toBuffer(doc);

    // Create response with proper headers for file download
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="legal-analysis-report-${Date.now()}.docx"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json({ 
      error: 'Failed to generate Word document' 
    }, { status: 500 });
  }
}