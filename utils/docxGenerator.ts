import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel,
  AlignmentType
} from "docx";

interface AnalysisData {
  document_info?: {
    file_name?: string;
    pages?: number;
    word_count?: number;
    analyzed_at?: string;
  };
  classification?: {
    document_type?: string;
    confidence?: number;
    categories?: string[];
  };
  clauses?: Array<{
    original: string;
    simplified: string;
    category?: string;
    confidence?: number;
  }>;
  summary?: string;
  legal_terms?: string[];
}

export async function generateAnalysisWordDoc(data: AnalysisData, fileName: string): Promise<Blob> {
  try {
    console.log('generateAnalysisWordDoc called with:', { data, fileName });
    
    const docInfo = data.document_info || {};
    const classification = data.classification || {};
    const clausesData = data.clauses;
    const clauses = Array.isArray(clausesData) ? clausesData : [];
    const legalTermsData = data.legal_terms;
    const legalTerms = Array.isArray(legalTermsData) ? legalTermsData : [];

    console.log('Extracted data:', { docInfo, classification, clausesCount: clauses.length, termsCount: legalTerms.length });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          text: "Legal Document Analysis Report",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),

        // Document Information Section
        new Paragraph({
          text: "Document Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "File Name: ", bold: true }),
            new TextRun({ text: docInfo.file_name || fileName }),
          ],
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Pages: ", bold: true }),
            new TextRun({ text: String(docInfo.pages || '—') }),
          ],
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Word Count: ", bold: true }),
            new TextRun({ text: docInfo.word_count?.toLocaleString() || '—' }),
          ],
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Analyzed At: ", bold: true }),
            new TextRun({ text: docInfo.analyzed_at || new Date().toISOString() }),
          ],
          spacing: { after: 400 },
        }),

        // Document Classification Section
        new Paragraph({
          text: "Document Classification",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Document Type: ", bold: true }),
            new TextRun({ text: classification.document_type || 'Unknown' }),
          ],
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Confidence: ", bold: true }),
            new TextRun({ text: classification.confidence ? `${(classification.confidence * 100).toFixed(1)}%` : 'N/A' }),
          ],
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Categories: ", bold: true }),
            new TextRun({ text: classification.categories?.join(', ') || 'N/A' }),
          ],
          spacing: { after: 400 },
        }),

        // Clause Analysis Section
        new Paragraph({
          text: "Clause Analysis",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Total Clauses Analyzed: ", bold: true }),
            new TextRun({ text: String(clauses.length) }),
          ],
          spacing: { after: 300 },
        }),

        // Clauses
        ...clauses.flatMap((clause, index) => {
          if (!clause || (!clause.original && !clause.simplified)) {
            return [];
          }
          
          return [
            new Paragraph({
              text: `Clause ${index + 1}`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 150 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Original Text: ", bold: true }),
                new TextRun({ text: clause.original || 'N/A' }),
              ],
              spacing: { after: 150 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Simplified Version: ", bold: true }),
                new TextRun({ text: clause.simplified || 'N/A' }),
              ],
              spacing: { after: 150 },
            }),

            ...(clause.category ? [
              new Paragraph({
                children: [
                  new TextRun({ text: "Category: ", bold: true }),
                  new TextRun({ text: clause.category }),
                ],
                spacing: { after: 150 },
              }),
            ] : []),

            ...(clause.confidence ? [
              new Paragraph({
                children: [
                  new TextRun({ text: "Confidence: ", bold: true }),
                  new TextRun({ text: `${(clause.confidence * 100).toFixed(1)}%` }),
                ],
                spacing: { after: 300 },
              }),
            ] : []),
          ];
        }),

        // Legal Terms Section
        ...(legalTerms.length > 0 ? [
          new Paragraph({
            text: "Legal Terms Extracted",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Total Terms: ", bold: true }),
              new TextRun({ text: String(legalTerms.length) }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: legalTerms.join(', '),
            spacing: { after: 400 },
          }),
        ] : []),

        // Summary Section
        ...(data.summary ? [
          new Paragraph({
            text: "Document Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: data.summary,
            spacing: { after: 400 },
          }),
        ] : []),

        // Footer
        new Paragraph({
          text: "---",
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({ 
              text: "This report was generated by AI-powered legal document analysis",
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

    console.log('Document object created, generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Blob generated successfully:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('Error in generateAnalysisWordDoc:', error);
    throw new Error(`Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
