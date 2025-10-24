# HuggingFace AI Integration - Legal Document Analysis

## Overview
This document describes the integration of HuggingFace AI models for legal document analysis in the analyze-report feature.

## Architecture

### API Endpoint: `/api/analyze-document`
**Location:** `app/api/analyze-document/route.ts`

This unified endpoint orchestrates all three HuggingFace-powered AI services:
1. **Clause Extraction** (via summarization)
2. **Clause Simplification** 
3. **Document Classification**

### Data Flow

```
User uploads PDF → /api/analyze-document
                         ↓
                    Save file to /public/uploads
                         ↓
                    Extract text from PDF
                         ↓
            ┌────────────┴────────────┐
            ↓                         ↓
   Document Classification    Extract Clauses (HF)
   (facebook/bart-large-mnli) (facebook/bart-large-cnn)
            ↓                         ↓
            └────────────┬────────────┘
                         ↓
                  Simplify Clauses (HF)
                  (philschmid/bart-large-cnn-samsum)
                         ↓
                  Classify Clause Types (HF)
                  (facebook/bart-large-mnli)
                         ↓
                  Extract Legal Terms (HF NER)
                  (dslim/bert-base-NER)
                         ↓
                  Build Unified Result
                         ↓
                  Return JSON to UI
```

## HuggingFace Models Used

### 1. Clause Extraction
- **Model:** `facebook/bart-large-cnn`
- **Task:** Summarization
- **Service:** `services/clauseExtractionService.ts`
- **Purpose:** Extract and segment legal clauses from document text
- **Input:** Chunked document text (max 4000 chars per chunk)
- **Output:** Array of clause strings

### 2. Clause Simplification
- **Model:** `philschmid/bart-large-cnn-samsum`
- **Task:** Summarization
- **Service:** `services/clauseSimplificationService.ts`
- **Purpose:** Simplify complex legal language into plain English
- **Input:** Array of extracted clauses
- **Output:** Array of simplified clause strings

### 3. Document Classification
- **Model:** `facebook/bart-large-mnli`
- **Task:** Zero-shot classification
- **Service:** `services/documentClassificationService.ts`
- **Purpose:** Classify overall document type
- **Input:** Full document text
- **Candidate Labels:**
  - Non-Disclosure Agreement
  - Lease Agreement
  - Employment Contract
  - Service Agreement
  - Partnership Agreement
- **Output:** Primary classification label

### 4. Clause Type Classification
- **Model:** `facebook/bart-large-mnli`
- **Task:** Zero-shot classification
- **Service:** `services/clauseSimplificationService.ts`
- **Purpose:** Classify each clause by legal category
- **Input:** Individual simplified clauses
- **Candidate Labels:**
  - Confidentiality
  - Liability
  - Termination
  - Jurisdiction
  - General
- **Output:** Label for each clause

### 5. Legal Term Extraction
- **Model:** `dslim/bert-base-NER`
- **Task:** Named Entity Recognition
- **Service:** `services/clauseSimplificationService.ts`
- **Purpose:** Extract organization names and legal entities
- **Input:** Simplified clauses
- **Output:** Set of unique legal terms/entities

## API Request/Response

### Request
```typescript
POST /api/analyze-document
Content-Type: multipart/form-data

{
  file: File (PDF or DOCX)
}
```

### Response
```typescript
{
  success: true,
  data: {
    document_info: {
      filename: string,
      size_bytes: number,
      pages: number,
      word_count: number,
      char_count: number
    },
    classification: {
      primary_classification: string,
      confidence_score: string
    },
    clauses: {
      total_found: number,
      classifications: Array<{
        clause: string,
        label: string
      }>
    },
    summary: {
      document_type: string,
      key_clauses: Array<{
        id: number,
        type: string,
        original: string,
        simplified: string
      }>,
      main_parties: Array<{
        text: string,
        type: string
      }>,
      important_dates: any[]
    },
    legal_terms: string[],
    raw_clauses: string[],
    simplified_clauses: string[]
  }
}
```

## UI Integration

### Analyze Report Page
**Location:** `app/analyze-report/page.tsx`

Features:
- Drag & drop file upload
- Multi-file batch processing
- Real-time progress indicators
- Results display with:
  - Document classification
  - Clause count and types
  - Simplified clause previews
  - Legal terms/parties
  - JSON/Word export options

## Service Files

### `services/clauseExtractionService.ts`
- Extracts text from PDF using `utils/pdfUtils.ts`
- Chunks text into manageable sizes (4000 chars)
- Calls HuggingFace BART summarization model
- Aggregates and parses clauses

### `services/clauseSimplificationService.ts`
- Three exported functions:
  - `simplifyClauses()` - Simplify legal language
  - `classifyClauses()` - Categorize clauses
  - `extractLegalTerms()` - NER for legal entities

### `services/documentClassificationService.ts`
- Classifies overall document type
- Uses zero-shot classification with predefined categories

## Utilities

### `utils/huggingfaceClient.ts`
- Central client for HuggingFace Inference API
- Handles authentication (HF API token)
- Error handling and retry logic
- Response normalization

### `utils/pdfUtils.ts`
- PDF text extraction
- Uses `pdf-parse` library with fallback to `pdfjs-dist`
- Handles local files and remote URLs

## Environment Variables

Required:
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

Get your API key from: https://huggingface.co/settings/tokens

## Error Handling

The integration includes robust error handling:
- File upload validation
- PDF parsing errors
- HuggingFace API failures (model loading, rate limits)
- Graceful degradation (continues on partial failures)
- Detailed server-side logging

## Testing

To test the integration:

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Navigate to: `http://localhost:3000/analyze-report`

3. Upload a sample PDF legal document

4. Watch the console for detailed logs:
   - `[analyze-document] Processing file: ...`
   - `[analyze-document] Extracting clauses...`
   - `[analyze-document] Simplifying clauses...`
   - etc.

5. Review the analysis results in the UI

## Performance Notes

- **Processing time:** Varies by document size and model availability
  - Small docs (1-5 pages): 10-30 seconds
  - Medium docs (5-20 pages): 30-90 seconds
  - Large docs (20+ pages): 90+ seconds

- **Chunking:** Large documents are automatically chunked to avoid tokenizer limits

- **Rate Limits:** HuggingFace free tier has rate limits; consider upgrading for production

## Future Enhancements

Potential improvements:
- [ ] Date extraction for contract terms/deadlines
- [ ] Risk scoring for clauses
- [ ] Comparison with standard templates
- [ ] Multi-language support
- [ ] Custom fine-tuned models for specific legal domains
- [ ] Caching for repeated document analysis
- [ ] Parallel processing for multi-file batches

## Troubleshooting

### "Unable to load a PDF parsing library"
- Ensure `pdf-parse` and `pdfjs-dist` are installed
- Restart dev server after installing dependencies
- Check `utils/pdfUtils.ts` logs for specific import errors

### "HuggingFace API error"
- Verify `HUGGINGFACE_API_KEY` is set in `.env.local`
- Check model availability (some models may be loading)
- Review rate limits on HuggingFace account
- Check server console for detailed error messages

### "Clause extraction returns empty array"
- Document may be scanned PDF (images, not text)
- Try OCR preprocessing
- Check if text extraction succeeded (review logs)

## Related Files

- `app/api/analyze-document/route.ts` - Main integration endpoint
- `app/analyze-report/page.tsx` - UI page
- `services/clauseExtractionService.ts` - Clause extraction logic
- `services/clauseSimplificationService.ts` - Simplification & classification
- `services/documentClassificationService.ts` - Document classification
- `utils/huggingfaceClient.ts` - HF API client
- `utils/pdfUtils.ts` - PDF text extraction

## License & Attribution

Models used are subject to their respective licenses on HuggingFace:
- BART models: Apache 2.0
- BERT NER: MIT

Always review model cards and licenses before production use.
