import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Document type patterns for classification
const DOCUMENT_PATTERNS = {
  'NDA (Non-Disclosure Agreement)': [
    'confidential', 'non-disclosure', 'proprietary information', 'trade secrets', 
    'confidentiality', 'disclosing party', 'receiving party', 'confidential information'
  ],
  'Lease Agreement': [
    'lease', 'rent', 'landlord', 'tenant', 'premises', 'rental', 'lease term',
    'security deposit', 'monthly rent', 'property', 'lessor', 'lessee'
  ],
  'Employment Contract': [
    'employee', 'employer', 'employment', 'salary', 'wages', 'job title',
    'position', 'work schedule', 'benefits', 'termination', 'duties', 'responsibilities'
  ],
  'Service Agreement': [
    'service provider', 'client', 'services', 'deliverables', 'scope of work',
    'payment terms', 'service fees', 'professional services'
  ],
  'Purchase Agreement': [
    'purchase', 'buyer', 'seller', 'goods', 'merchandise', 'payment',
    'delivery', 'purchase price', 'sale', 'product'
  ],
  'Partnership Agreement': [
    'partner', 'partnership', 'business', 'profit', 'loss', 'capital',
    'management', 'dissolution', 'equity', 'joint venture'
  ],
  'Court Judgment': [
    'court', 'judgment', 'plaintiff', 'defendant', 'case', 'appeal',
    'ruling', 'justice', 'bench', 'verdict', 'sentence', 'conviction'
  ],
  'General Legal Document': [
    'legal', 'law', 'statute', 'regulation', 'compliance', 'jurisdiction',
    'whereas', 'hereby', 'herein', 'party', 'agreement', 'contract'
  ]
};

// Enhanced document text extraction supporting multiple formats
async function extractDocumentText(file: File) {
  const fileExtension = path.extname(file.name).toLowerCase();
  
  switch (fileExtension) {
    case '.pdf':
      return await extractPdfText(file);
    case '.docx':
      return await extractDocxText(file);
    default:
      throw new Error(`Unsupported file format: ${fileExtension}. Supported formats: .pdf, .docx`);
  }
}

// PDF text extraction
async function extractPdfText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const dataBuffer = Buffer.from(arrayBuffer);
  const data = await pdf(dataBuffer);
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
    format: 'PDF'
  };
}

// DOCX text extraction
async function extractDocxText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const dataBuffer = Buffer.from(arrayBuffer);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  
  return {
    text: result.value,
    pages: Math.ceil(result.value.length / 3000), // Estimate pages (3000 chars ≈ 1 page)
    info: { format: 'DOCX' },
    format: 'DOCX',
    messages: result.messages // Any conversion warnings
  };
}

// Advanced document type classification
function classifyDocumentType(text: string) {
  const textLower = text.toLowerCase();
  const scores: Record<string, number> = {};
  const detectedKeywords: Record<string, Array<{keyword: string, count: number}>> = {};

  // Calculate scores for each document type
  for (const [docType, keywords] of Object.entries(DOCUMENT_PATTERNS)) {
    scores[docType] = 0;
    detectedKeywords[docType] = [];

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        scores[docType] += matches.length;
        detectedKeywords[docType].push({
          keyword,
          count: matches.length
        });
      }
    });
  }

  // Find the document type with highest score
  const sortedTypes = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .filter(([,score]) => score > 0);

  const primaryType = sortedTypes.length > 0 ? sortedTypes[0] : ['Unknown Document Type', 0];

  return {
    primary_classification: primaryType[0],
    confidence_score: primaryType[1],
    all_scores: scores,
    detected_keywords: detectedKeywords[primaryType[0]] || [],
    alternative_classifications: sortedTypes.slice(1, 3).map(([type, score]) => ({
      type,
      score,
      keywords: detectedKeywords[type] || []
    }))
  };
}

// Enhanced clause extraction and segmentation
function extractClauses(text: string) {
  // Split by common legal clause indicators
  const clauseIndicators = [
    /\n\s*\d+\.\s+/g,           // Numbered clauses (1., 2., etc.)
    /\n\s*\([a-z]\)\s+/g,       // Letter clauses ((a), (b), etc.)
    /\n\s*\(i+\)\s+/g,          // Roman numeral clauses
    /\n\s*Article\s+\d+/gi,     // Article clauses
    /\n\s*Section\s+\d+/gi,     // Section clauses
    /\n\s*WHEREAS\s+/gi,        // Whereas clauses
    /\n\s*NOW\s+THEREFORE\s+/gi, // Therefore clauses
    /\n{2,}/g                   // Double line breaks
  ];

  let segments = [text];
  
  // Apply each splitting pattern
  clauseIndicators.forEach(pattern => {
    const newSegments: string[] = [];
    segments.forEach(segment => {
      const parts = segment.split(pattern);
      newSegments.push(...parts.filter(part => part.trim().length > 0));
    });
    segments = newSegments;
  });

  // Filter and clean clauses
  const clauses = segments
    .filter(clause => clause.trim().length > 50) // Minimum meaningful length
    .map((clause, index) => ({
      id: index + 1,
      text: clause.trim(),
      word_count: clause.trim().split(/\s+/).length,
      char_count: clause.trim().length,
      type: detectClauseType(clause.trim())
    }))
    .sort((a, b) => b.word_count - a.word_count) // Sort by relevance/length
    .slice(0, 20); // Limit to top 20 most substantial clauses

  return clauses;
}

// Detect clause type based on content
function detectClauseType(clauseText: string) {
  const lowerText = clauseText.toLowerCase();
  
  const clauseTypes: Record<string, string[]> = {
    'Definitions': ['define', 'definition', 'means', 'shall mean', 'refers to'],
    'Obligations': ['shall', 'must', 'required to', 'obligated', 'duty'],
    'Rights': ['right', 'entitled to', 'may', 'permitted'],
    'Termination': ['terminate', 'termination', 'end', 'expiry', 'dissolution'],
    'Payment': ['payment', 'pay', 'fee', 'cost', 'price', 'compensation'],
    'Confidentiality': ['confidential', 'secret', 'proprietary', 'non-disclosure'],
    'Liability': ['liable', 'liability', 'responsible', 'damages', 'loss'],
    'Governing Law': ['governed by', 'jurisdiction', 'applicable law', 'court'],
    'General': []
  };

  for (const [type, keywords] of Object.entries(clauseTypes)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return type;
    }
  }
  
  return 'General';
}

// Simplify complex legal language to layman terms
function simplifyLegalLanguage(clauseText: string) {
  const simplificationRules: Record<string, string> = {
    // Legal jargon to plain English
    'whereas': 'since',
    'herein': 'in this document',
    'hereinafter': 'from now on',
    'heretofore': 'until now',
    'hereby': 'by this document',
    'herewith': 'with this',
    'aforementioned': 'mentioned above',
    'aforesaid': 'said above',
    'notwithstanding': 'despite',
    'pursuant to': 'according to',
    'in lieu of': 'instead of',
    'vis-à-vis': 'compared to',
    'inter alia': 'among other things',
    'ipso facto': 'by the fact itself',
    'prima facie': 'at first sight',
    'bona fide': 'genuine',
    'ad hoc': 'for this specific purpose',
    'per se': 'by itself',
    'quid pro quo': 'something for something',
    'sine qua non': 'essential requirement',
    
    // Complex legal phrases
    'shall be deemed': 'will be considered',
    'shall not be construed': 'should not be interpreted',
    'subject to the provisions': 'following the rules',
    'in accordance with': 'following',
    'with respect to': 'regarding',
    'in relation to': 'about',
    'for the purpose of': 'to',
    'in the event that': 'if',
    'provided that': 'as long as',
    'on condition that': 'only if',
    'save and except': 'except for',
    
    // Legal actions
    'commence proceedings': 'start legal action',
    'render null and void': 'cancel',
    'indemnify and hold harmless': 'protect from legal claims',
    'liquidated damages': 'agreed penalty amount'
  };

  let simplified = clauseText;
  
  // Apply simplification rules
  for (const [complex, simple] of Object.entries(simplificationRules)) {
    const regex = new RegExp(`\\b${complex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  }

  // Sentence structure improvements
  simplified = simplified
    .replace(/;/g, '.') // Replace semicolons with periods for clarity
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure proper sentence spacing

  return simplified;
}

// Local entity extraction
function extractEntitiesLocally(text: string) {
  const entities = {
    persons: [] as Array<{text: string, confidence: number, type: string}>,
    organizations: [] as Array<{text: string, confidence: number, type: string}>,
    locations: [] as Array<{text: string, confidence: number, type: string}>,
    dates: [] as Array<{text: string, confidence: number, type: string}>,
    legal_references: [] as Array<{text: string, confidence: number, type: string}>,
    other: [] as Array<{text: string, confidence: number, type: string}>
  };

  // Extract dates
  const datePatterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}(st|nd|rd|th)\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi
  ];

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        entities.dates.push({
          text: match,
          confidence: 0.8,
          type: 'date'
        });
      });
    }
  });

  // Extract potential person names (capitalized words)
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const potentialNames = text.match(namePattern) || [];
  
  potentialNames
    .filter(name => name.split(' ').length >= 2) // At least first and last name
    .slice(0, 10) // Limit to avoid noise
    .forEach(name => {
      entities.persons.push({
        text: name,
        confidence: 0.6,
        type: 'person'
      });
    });

  return entities;
}

// Calculate complexity reduction percentage
function calculateComplexityReduction(originalText: string) {
  const simplifiedText = simplifyLegalLanguage(originalText);
  
  const originalComplexity = (originalText.match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  const simplifiedComplexity = (simplifiedText.match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  
  if (originalComplexity === 0) return 0;
  
  return Math.round(((originalComplexity - simplifiedComplexity) / originalComplexity) * 100);
}

// Main processing function
async function processLegalDocument(file: File) {
  const docData = await extractDocumentText(file);
  const classification = classifyDocumentType(docData.text);
  const clauses = extractClauses(docData.text);
  
  const simplifiedClauses = clauses.map(clause => ({
    ...clause,
    original: clause.text,
    simplified: simplifyLegalLanguage(clause.text),
    complexity_reduction: calculateComplexityReduction(clause.text)
  }));

  const entities = extractEntitiesLocally(docData.text);

  return {
    document_info: {
      pages: docData.pages,
      total_characters: docData.text.length,
      total_words: docData.text.split(/\s+/).length,
      processed_date: new Date().toISOString()
    },
    classification: classification,
    clauses: {
      total_found: clauses.length,
      detailed_analysis: simplifiedClauses
    },
    entities: entities,
    summary: {
      document_type: classification.primary_classification,
      confidence: classification.confidence_score,
      key_clauses: simplifiedClauses.slice(0, 5),
      main_parties: entities.persons?.slice(0, 3) || [],
      important_dates: entities.dates?.slice(0, 3) || []
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload PDF or DOCX files only.' 
      }, { status: 400 });
    }

    // Process the document directly from memory
    const results = await processLegalDocument(file);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json({ 
      error: 'Failed to process document. Please try again.' 
    }, { status: 500 });
  }
}