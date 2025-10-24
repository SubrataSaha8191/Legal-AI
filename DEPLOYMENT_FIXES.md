# Deployment Fixes for PDF Parsing Issues

## Problem Summary
After deployment to Vercel, PDF parsing was failing with errors:
- `Failed to extract text from PDF. Ensure pdf-parse or pdfjs-dist are installed and functional.`
- `No final analysis returned`

## Root Causes

### 1. **pdf-parse Dependency Issue**
- `pdf-parse` requires native dependencies (canvas, node-gyp) that don't work in serverless environments
- In Vercel's serverless functions, native modules fail to compile/run
- The library was being tried first, causing failures before the fallback could run

### 2. **Insufficient Function Resources**
- PDF processing is memory and CPU intensive
- Default Vercel function limits (1024MB, 10s timeout) were insufficient
- Large PDFs or complex processing could timeout or OOM

### 3. **Poor Error Handling**
- Generic error messages didn't indicate which parsing step failed
- No differentiation between empty PDFs vs parsing failures
- Logs were insufficient for debugging in production

## Solutions Implemented

### 1. **Prioritize pdfjs-dist Over pdf-parse**
Changed both `services/textExtractionService.ts` and `utils/pdfUtils.ts` to:
- Try `pdfjs-dist` FIRST (works in serverless)
- Fall back to `pdf-parse` only if pdfjs-dist fails
- Check for empty text before returning success

**Before:**
```typescript
// Try pdf-parse first → fails in serverless
// Then try pdfjs-dist → might not reach here
```

**After:**
```typescript
// Try pdfjs-dist first → works in serverless ✅
// Then try pdf-parse → fallback for local dev
```

### 2. **Increased Vercel Function Resources**
Updated `vercel.json` to configure function limits:
```json
"functions": {
  "app/api/analyze-document/route.ts": {
    "memory": 3008,      // Max memory (3GB)
    "maxDuration": 60    // 60 second timeout
  },
  "app/api/*/route.ts": {
    "memory": 1024,      // Default for other APIs
    "maxDuration": 30
  }
}
```

### 3. **Enhanced Error Handling**
- Added specific try-catch around PDF extraction
- Return meaningful error messages with filename
- Distinguish between:
  - File loading errors
  - Parsing failures
  - Empty PDFs (422 status)
  - General failures (500 status)
- Comprehensive logging for debugging

**Example improved error:**
```
M_S_K_B_Labs_vs_Jammu_And_Kashmir_Bank_Ltd_And_Ors_on_6_September_2023.PDF: 
Failed to extract text from PDF. Both pdfjs-dist and pdf-parse failed. Check logs for details.
```

### 4. **Better Logging**
Added detailed console logs:
- Character count after successful extraction
- Stack traces for parsing errors
- Empty text detection warnings
- Step-by-step progress for debugging

## How to Deploy

### 1. **Commit and Push Changes**
```powershell
git add .
git commit -m "Fix PDF parsing for Vercel deployment"
git push origin main
```

### 2. **Verify Vercel Build**
- Go to your Vercel dashboard
- Check that the deployment completes successfully
- Review build logs for any warnings

### 3. **Set Environment Variables**
Ensure these are set in Vercel dashboard:
- `GEMINI_API_KEY`
- `HUGGINGFACE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_*` (all Firebase config vars)

### 4. **Test with Problematic PDF**
1. Upload `M_S_K_B_Labs_vs_Jammu_And_Kashmir_Bank_Ltd_And_Ors_on_6_September_2023.PDF`
2. Check browser console for SSE events
3. Verify progress completes to 100%
4. Check Vercel function logs for detailed output

## Monitoring in Production

### Check Vercel Logs
```bash
vercel logs [deployment-url] --follow
```

Look for:
- `✅ Extracted X chars from filename.pdf` (success)
- `❌ PDF extraction failed` (errors)
- Memory usage warnings
- Timeout errors

### Common Issues

**Issue:** `pdfjs-dist failed: Cannot find module`
- **Solution:** Ensure `pdfjs-dist` is in `dependencies` (not devDependencies)
- Run `pnpm install` and redeploy

**Issue:** Function timeout after 10 seconds
- **Solution:** Already fixed with `maxDuration: 60` in vercel.json
- For very large PDFs, may need to increase further (max 300s on Pro plan)

**Issue:** Out of memory errors
- **Solution:** Already increased to 3008MB
- Consider client-side chunking for very large PDFs

**Issue:** Empty text extracted from PDF
- **Possible Causes:**
  - PDF contains only scanned images (no text layer)
  - PDF is encrypted/password protected
  - Corrupted PDF file
- **Solution:** Implement OCR for image-based PDFs (future enhancement)

## Future Improvements

1. **Add OCR Support**
   - For image-based PDFs
   - Use services like Tesseract.js or Google Vision API

2. **Progressive Processing**
   - Stream PDF processing page-by-page
   - Reduce memory footprint
   - Better progress feedback

3. **Client-Side Validation**
   - Check PDF validity before upload
   - Show warnings for large files
   - Estimate processing time

4. **Caching**
   - Cache extracted text for repeated analysis
   - Use Vercel KV or Redis

5. **Remove pdf-parse**
   - If pdfjs-dist proves reliable
   - Reduce bundle size
   - Simplify dependencies

## Testing Checklist

- [ ] Build succeeds locally (`pnpm build`)
- [ ] Dev server works (`pnpm dev`)
- [ ] Test with sample PDF locally
- [ ] Deploy to Vercel
- [ ] Test with small PDF (<1MB)
- [ ] Test with medium PDF (1-5MB)
- [ ] Test with large PDF (5-10MB)
- [ ] Test with the problematic PDF from error report
- [ ] Check Vercel function logs
- [ ] Verify all progress steps complete
- [ ] Confirm final analysis is returned

## Rollback Plan

If issues persist:
1. Revert to previous commit: `git revert HEAD`
2. Push: `git push origin main`
3. Vercel will auto-deploy the rollback
4. Investigate logs from failed deployment
5. Test fixes locally before redeploying
