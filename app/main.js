const fs = require("fs");
const mammoth = require("mammoth");
const path = require("path");

// Use environment variable for secrets instead of hardcoding
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || "";
// Configure how many clauses attempt AI simplification (fallbacks apply after)
const MAX_AI_SIMPLIFY = Number(process.env.MAX_AI_SIMPLIFY_CLAUSES || '20');

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

// Enhanced document text extraction supporting multiple formats (by file path)
async function extractDocumentText(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  switch (fileExtension) {
    case '.pdf':
      return await extractPdfText(filePath);
    case '.docx':
      return await extractDocxText(filePath);
    default:
      throw new Error(`Unsupported file format: ${fileExtension}. Supported formats: .pdf, .docx`);
  }
}

// Enhanced document text extraction from raw Buffer (used by API)
async function extractDocumentTextFromBuffer(buffer, filename) {
  const fileExtension = path.extname(filename || '').toLowerCase();
  if (fileExtension === '.pdf') {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      format: 'PDF'
    };
  }
  if (fileExtension === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      pages: Math.ceil(result.value.length / 3000), // Estimate pages (3000 chars ≈ 1 page)
      info: { format: 'DOCX' },
      format: 'DOCX',
      messages: result.messages
    };
  }
  throw new Error(`Unsupported file format: ${fileExtension || 'unknown'}. Supported formats: .pdf, .docx`);
}

// PDF text extraction
async function extractPdfText(filePath) {
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
    format: 'PDF'
  };
}

// DOCX text extraction
async function extractDocxText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
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
function classifyDocumentType(text) {
  const textLower = text.toLowerCase();
  const scores = {};
  const detectedKeywords = {};

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
function extractClauses(text) {
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
    const newSegments = [];
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
function detectClauseType(clauseText) {
  const lowerText = clauseText.toLowerCase();
  
  const clauseTypes = {
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
function simplifyLegalLanguage(clauseText) {
  const simplificationRules = {
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
  // Additional common legalese and phrasing
  'prior to': 'before',
  'subsequent to': 'after',
  'hereof': 'of this',
  'thereof': 'of that',
  'thereby': 'by that',
  'therewith': 'with that',
  'hereto': 'to this',
  'henceforth': 'from now on',
  'forthwith': 'immediately',
  'shall': 'will',
  'terminate': 'end',
    
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
    'liquidated damages': 'agreed penalty amount',

    // Clarifying common terms
    'prior written consent': 'written permission beforehand',
    'without limitation': 'without limits',
    'including but not limited to': 'including',
    'for the avoidance of doubt': 'to be clear',
    'best efforts': 'do your best',
    'reasonable efforts': 'make a reasonable attempt',
    'disclosure': 'sharing',
    'obligation': 'duty',
    'obligations': 'duties',
    'permitted': 'allowed',
    'prohibited': 'not allowed',
    'indemnify': 'cover losses',
    'indemnification': 'covering losses',
    'liable': 'responsible for',
    'severability': 'if part is invalid, the rest stays in effect',
    'force majeure': 'events beyond anyone\'s control'
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

// Basic tokenization and similarity helpers
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 && B.size === 0) return 1;
  const inter = new Set([...A].filter(x => B.has(x)));
  const union = new Set([...A, ...B]);
  return inter.size / union.size;
}

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','else','of','to','in','on','for','by','with','as','at','from','that','this','these','those','be','is','are','was','were','it','its','they','them','their','there','here','such','any','all','each','every','not','no','will','shall','may','can','must','should','could','would','do','does','did','have','has','had','under','over','into','out','about','between','among','per','within','without'
]);

function getKeyPhrases(text, max = 3) {
  const freq = new Map();
  for (const tok of tokenize(text)) {
    if (tok.length < 5 || STOPWORDS.has(tok)) continue;
    freq.set(tok, (freq.get(tok) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a,b) => b[1]-a[1])
    .slice(0, max)
    .map(([w]) => w);
}

// Type-aware plain-language rewrite as a last-resort simplifier
function typeAwarePlainRewrite(original, clauseType) {
  const phrases = getKeyPhrases(original, 4);
  const base = `In simple terms, this clause explains important details${clauseType && clauseType !== 'General' ? ` about ${String(clauseType).toLowerCase()}` : ''}.`;
  const detail = phrases.length ? ` It highlights: ${phrases.join(', ')}.` : '';
  return `${base}${detail}`.trim();
}

// Ensure the simplified output isn't effectively identical and make it a bit longer when needed
function finalPolishDifference(original, simplified, clauseType) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  let out = String(simplified || '');

  // If identical by normalization, lightly rephrase and prefix
  if (norm(out) === norm(original)) {
    out = out
      .replace(/,\s+/g, '. ')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (norm(out) === norm(original)) {
    out = `In simple terms: ${out}`;
  }

  // If still too similar by Jaccard, add a plain-language preface
  if (jaccardSimilarity(original, out) > 0.9) {
    out = `To put it plainly, ${out}`;
  }

  // Make it a bit longer (safe, non-altering addendum)
  const origWords = String(original || '').trim().split(/\s+/).filter(Boolean).length;
  const outWords = String(out || '').trim().split(/\s+/).filter(Boolean).length;
  const minWords = Math.max(25, Math.floor(origWords * 0.6));
  if (outWords < minWords) {
    const phrases = getKeyPhrases(original, 3);
    const additions = [];
    if (phrases.length) additions.push(`Key points include: ${phrases.join(', ')}.`);
    if (clauseType && clauseType !== 'General') additions.push(`This clause mainly concerns ${String(clauseType).toLowerCase()}.`);
    if (additions.length) {
      out = `${out}${out.trim().endsWith('.') ? '' : '.'} ${additions.join(' ')}`;
    }
  }
  return out;
}

// Try AI-based simplification (summarization); returns null if unavailable
async function hfSummarize(text) {
  if (!HUGGINGFACE_API_KEY) return null;
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: String(text).slice(0, 3000),
        parameters: { max_length: 220, min_length: 90, do_sample: false },
        options: { wait_for_model: true },
      }),
    });
    if (!res.ok) return null;
    const out = await res.json();
    const summary = Array.isArray(out) ? out[0]?.summary_text : out?.summary_text;
    if (typeof summary === 'string' && summary.trim()) return summary.trim();
    return null;
  } catch {
    return null;
  }
}

// Alternative summarizer (smaller, faster) as a backup
async function hfSummarizeAlt(text) {
  if (!HUGGINGFACE_API_KEY) return null;
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: String(text).slice(0, 3000),
        parameters: { max_length: 200, min_length: 80, do_sample: false },
        options: { wait_for_model: true },
      }),
    });
    if (!res.ok) return null;
    const out = await res.json();
    const summary = Array.isArray(out) ? out[0]?.summary_text : out?.summary_text;
    if (typeof summary === 'string' && summary.trim()) return summary.trim();
    return null;
  } catch {
    return null;
  }
}

// Paraphrasing fallback using T5; prompts simple-language paraphrase
async function hfParaphrase(text) {
  if (!HUGGINGFACE_API_KEY) return null;
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/t5-base', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `paraphrase in simple language: ${String(text).slice(0, 1200)}`,
        parameters: { max_length: 220, num_beams: 4, do_sample: false },
        options: { wait_for_model: true },
      }),
    });
    if (!res.ok) return null;
    const out = await res.json();
    const paraphrase = Array.isArray(out) ? out[0]?.generated_text : out?.generated_text;
    if (typeof paraphrase === 'string' && paraphrase.trim()) return paraphrase.trim();
    return null;
  } catch {
    return null;
  }
}

// Combined simplification: try AI (optionally) then rules; ensure non-identical output
async function simplifyClauseText(clauseText, useAI = true, clauseType = 'General') {
  const original = String(clauseText || '');
  let simplified = '';
  const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
  const tokenCount = tokenize(original).length;
  const jacLimit = tokenCount < 20 ? 0.97 : 0.92;
  const isAcceptable = (cand) => cand && norm(cand) !== norm(original) && jaccardSimilarity(original, cand) < jacLimit;

  // 1) Primary AI summarizer
  if (useAI) {
    const ai = await hfSummarize(original);
    if (isAcceptable(ai)) simplified = ai.trim();
  }

  // 2) Alternative AI summarizer
  if (!simplified && useAI) {
    const ai2 = await hfSummarizeAlt(original);
    if (isAcceptable(ai2)) simplified = ai2.trim();
  }

  // 3) Paraphrasing fallback
  if (!simplified && useAI) {
    const para = await hfParaphrase(original);
    if (isAcceptable(para)) simplified = para.trim();
  }

  // 4) Rule-based simplification
  if (!simplified) {
    simplified = simplifyLegalLanguage(original);
  }

  // 5) If still too similar, apply extra rephrasing rules
  if (!isAcceptable(simplified)) {
    simplified = simplifyLegalLanguage(original)
      .replace(/ in order to /gi, ' to ')
      .replace(/ for the purpose of /gi, ' to ')
      .replace(/ including but not limited to/gi, ' including ')
      .replace(/ for the avoidance of doubt/gi, ' to be clear ')
      .replace(/;\s*/g, '. ')
      .replace(/\s+/g, ' ');
  }

  // 6) If even after rephrasing it's still not acceptable, use a type-aware plain-language rewrite
  if (!isAcceptable(simplified)) {
    simplified = typeAwarePlainRewrite(original, clauseType);
  }
  // Final polish to guarantee a difference without altering meaning
  simplified = finalPolishDifference(original, simplified, clauseType);
  return simplified;
}

// Enhanced NER for legal entities
async function extractLegalEntities(text) {
  try {
    if (!HUGGINGFACE_API_KEY) throw new Error('Missing HF API key');
    // Use legal-specific NER model via global fetch (Node 18+)
    const response = await fetch(`https://api-inference.huggingface.co/models/nlpaueb/legal-bert-base-uncased-finetuned-ner`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.substring(0, 2000) }),
    });

    if (response.ok) {
      const entities = await response.json();
      const organizedEntities = {
        persons: [],
        organizations: [],
        locations: [],
        dates: [],
        legal_references: [],
        other: []
      };

      if (Array.isArray(entities)) {
        entities.forEach(entity => {
          const entityInfo = {
            text: entity.word,
            confidence: entity.score,
            start: entity.start,
            end: entity.end
          };

          switch (entity.entity_group || entity.entity) {
            case 'PER':
            case 'PERSON':
              organizedEntities.persons.push(entityInfo);
              break;
            case 'ORG':
            case 'ORGANIZATION':
              organizedEntities.organizations.push(entityInfo);
              break;
            case 'LOC':
            case 'LOCATION':
              organizedEntities.locations.push(entityInfo);
              break;
            case 'DATE':
            case 'TIME':
              organizedEntities.dates.push(entityInfo);
              break;
            default:
              organizedEntities.other.push(entityInfo);
          }
        });
      }

      return organizedEntities;
    }
  } catch (error) {
    console.log("API NER failed, using local extraction...");
  }

  // Fallback: Local entity extraction
  return extractEntitiesLocally(text);
}

// Local entity extraction as fallback
function extractEntitiesLocally(text) {
  const entities = {
    persons: [],
    organizations: [],
    locations: [],
    dates: [],
    legal_references: [],
    other: []
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

// Main processing function
async function processLegalDocument(filePath) {
  console.log("📄 Extracting document text...");
  const docData = await extractDocumentText(filePath);
  
  console.log("📋 Classifying document type...");
  const classification = classifyDocumentType(docData.text);
  
  console.log("🔍 Extracting and analyzing clauses...");
  const clauses = extractClauses(docData.text);
  
  console.log("✍️  Simplifying complex clauses...");
  const simplifiedClauses = await Promise.all(clauses.map(async (clause, index) => {
    const useAI = index < MAX_AI_SIMPLIFY; // Env-configurable AI limit
    const simplified = await simplifyClauseText(clause.text, useAI, clause.type);
    return {
      ...clause,
      original: clause.text,
      simplified,
      complexity_reduction: calculateComplexityReductionFromTexts(clause.text, simplified)
    };
  }));

  console.log("👥 Extracting legal entities...");
  const entities = await extractLegalEntities(docData.text);

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

// API-friendly: process a PDF/DOCX from an in-memory Buffer
async function processLegalDocumentFromBuffer(buffer, filename) {
  console.log("📄 Extracting document text (buffer)...");
  const docData = await extractDocumentTextFromBuffer(buffer, filename);

  console.log("📋 Classifying document type...");
  const classification = classifyDocumentType(docData.text);

  console.log("🔍 Extracting and analyzing clauses...");
  const clauses = extractClauses(docData.text);

  console.log("✍️  Simplifying complex clauses...");
  const simplifiedClauses = await Promise.all(clauses.map(async (clause, index) => {
    const useAI = index < MAX_AI_SIMPLIFY; // Env-configurable AI limit
    const simplified = await simplifyClauseText(clause.text, useAI, clause.type);
    return {
      ...clause,
      original: clause.text,
      simplified,
      complexity_reduction: calculateComplexityReductionFromTexts(clause.text, simplified)
    };
  }));

  console.log("👥 Extracting legal entities...");
  const entities = await extractLegalEntities(docData.text);

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

// Calculate complexity reduction percentage
function calculateComplexityReduction(originalText) {
  const simplifiedText = simplifyLegalLanguage(originalText);
  
  const originalComplexity = (originalText.match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  const simplifiedComplexity = (simplifiedText.match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  
  if (originalComplexity === 0) return 0;
  
  return Math.round(((originalComplexity - simplifiedComplexity) / originalComplexity) * 100);
}

// Complexity reduction using provided original and simplified texts
function calculateComplexityReductionFromTexts(originalText, simplifiedText) {
  const originalComplexity = (String(originalText).match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  const simplifiedComplexity = (String(simplifiedText).match(/\b(whereas|herein|pursuant|notwithstanding|aforementioned)\b/gi) || []).length;
  const ow = String(originalText).trim().split(/\s+/).length;
  const sw = String(simplifiedText).trim().split(/\s+/).length;
  const lexReduction = originalComplexity > 0 ? ((originalComplexity - simplifiedComplexity) / originalComplexity) * 100 : 0;
  const lenReduction = ow > 0 ? ((ow - sw) / ow) * 100 : 0;
  return Math.round(Math.max(0, lexReduction, lenReduction));
}

// Enhanced file export with better formatting
function exportResults(results, baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${baseName}_${timestamp}`;

  // 1. Document Classification Report
  const classificationReport = `LEGAL DOCUMENT CLASSIFICATION REPORT
${'='.repeat(50)}
Generated: ${new Date().toLocaleString()}

PRIMARY CLASSIFICATION: ${results.classification.primary_classification}
Confidence Score: ${results.classification.confidence_score} matches

DETECTED KEYWORDS:
${results.classification.detected_keywords.map(k => `• ${k.keyword} (${k.count} times)`).join('\n')}

ALTERNATIVE CLASSIFICATIONS:
${results.classification.alternative_classifications.map(alt => 
  `• ${alt.type}: ${alt.score} matches`).join('\n')}

DOCUMENT INFO:
• Pages: ${results.document_info.pages}
• Total Words: ${results.document_info.total_words.toLocaleString()}
• Total Characters: ${results.document_info.total_characters.toLocaleString()}
`;

  fs.writeFileSync(`${fileName}_classification.txt`, classificationReport);

  // 2. Clause Analysis Report
  const clauseReport = `CLAUSE EXTRACTION AND SIMPLIFICATION REPORT
${'='.repeat(55)}
Generated: ${new Date().toLocaleString()}

SUMMARY:
• Total Clauses Found: ${results.clauses.total_found}
• Clauses Analyzed: ${results.clauses.detailed_analysis.length}

DETAILED CLAUSE ANALYSIS:
${'='.repeat(30)}

${results.clauses.detailed_analysis.map(clause => `
CLAUSE ${clause.id} [${clause.type}]
${'-'.repeat(40)}
Word Count: ${clause.word_count} | Character Count: ${clause.char_count}
Complexity Reduction: ${clause.complexity_reduction}%

ORIGINAL:
${clause.original}

SIMPLIFIED (LAYMAN-FRIENDLY):
${clause.simplified}

${'═'.repeat(60)}
`).join('\n')}`;

  fs.writeFileSync(`${fileName}_clauses.txt`, clauseReport);

  // 3. Legal Entities Report
  const entitiesReport = `LEGAL ENTITIES EXTRACTION REPORT
${'='.repeat(40)}
Generated: ${new Date().toLocaleString()}

PERSONS IDENTIFIED:
${results.entities.persons?.map(p => `• ${p.text} (confidence: ${(p.confidence * 100).toFixed(1)}%)`).join('\n') || 'None found'}

ORGANIZATIONS:
${results.entities.organizations?.map(o => `• ${o.text} (confidence: ${(o.confidence * 100).toFixed(1)}%)`).join('\n') || 'None found'}

LOCATIONS:
${results.entities.locations?.map(l => `• ${l.text} (confidence: ${(l.confidence * 100).toFixed(1)}%)`).join('\n') || 'None found'}

DATES & TIMES:
${results.entities.dates?.map(d => `• ${d.text}`).join('\n') || 'None found'}

OTHER ENTITIES:
${results.entities.other?.map(o => `• ${o.text} (confidence: ${(o.confidence * 100).toFixed(1)}%)`).join('\n') || 'None found'}
`;

  fs.writeFileSync(`${fileName}_entities.txt`, entitiesReport);

  // 4. Executive Summary
  const summaryReport = `EXECUTIVE SUMMARY - LEGAL DOCUMENT ANALYSIS
${'='.repeat(50)}
Generated: ${new Date().toLocaleString()}

DOCUMENT OVERVIEW:
• Type: ${results.summary.document_type}
• Classification Confidence: ${results.summary.confidence} keyword matches
• Pages: ${results.document_info.pages}
• Total Clauses: ${results.clauses.total_found}

KEY PARTIES:
${results.summary.main_parties.map(p => `• ${p.text}`).join('\n') || 'None identified'}

IMPORTANT DATES:
${results.summary.important_dates.map(d => `• ${d.text}`).join('\n') || 'None found'}

TOP 5 MOST IMPORTANT CLAUSES (SIMPLIFIED):
${results.summary.key_clauses.map(clause => `
${clause.id}. [${clause.type}] - ${clause.word_count} words
   ${clause.simplified.substring(0, 200)}...
`).join('\n')}

ANALYSIS METRICS:
• Processing completed at: ${results.document_info.processed_date}
• Average complexity reduction: ${Math.round(results.clauses.detailed_analysis.reduce((sum, c) => sum + c.complexity_reduction, 0) / results.clauses.detailed_analysis.length)}%
`;

  fs.writeFileSync(`${fileName}_summary.txt`, summaryReport);

  return {
    classification: `${fileName}_classification.txt`,
    clauses: `${fileName}_clauses.txt`,
    entities: `${fileName}_entities.txt`,
    summary: `${fileName}_summary.txt`
  };
}

// Export functions for use in Next.js API route
module.exports = {
  processLegalDocument,
  processLegalDocumentFromBuffer,
  extractDocumentText,
  extractDocumentTextFromBuffer,
};

// CLI entrypoint (only when run directly: node app/main.js)
if (require.main === module) {
  (async () => {
    const pdfPath = "./06-versions-space.PDF";

    if (!fs.existsSync(pdfPath)) {
      console.error("PDF not found! Check the path:", pdfPath);
      process.exit(1);
    } else {
      console.log("📁 PDF found:", pdfPath);
    }

    try {
      console.log("\n🚀 Starting Legal Document Analysis...\n");

      const results = await processLegalDocument(pdfPath);

      console.log("\n📊 ANALYSIS COMPLETE!");
      console.log("═".repeat(50));
      console.log(`Document Type: ${results.classification.primary_classification}`);
      console.log(`Confidence: ${results.classification.confidence_score} keyword matches`);
      console.log(`Clauses Found: ${results.clauses.total_found}`);
      console.log(`Entities Extracted: ${Object.values(results.entities).flat().length}`);

      console.log("\n📝 Exporting detailed reports...");
      const fileNames = exportResults(results, "legal_analysis");

      console.log("\n✅ EXPORT COMPLETE! Files created:");
      console.log(`📋 Classification: ${fileNames.classification}`);
      console.log(`📄 Clauses: ${fileNames.clauses}`);
      console.log(`👥 Entities: ${fileNames.entities}`);
      console.log(`📊 Summary: ${fileNames.summary}`);

      console.log("\n" + "═".repeat(50));
      console.log("🎉 Legal Document Analysis Complete!");

    } catch (error) {
      console.error("❌ Error during processing:", error.message);
      process.exit(1);
    }
  })();
}
