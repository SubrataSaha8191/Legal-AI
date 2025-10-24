# Deployment Checklist & Potential Issues

## ✅ Build Status
- **Production build:** Compiles successfully
- **TypeScript:** No type errors
- **Linting:** Passes (with ESLint option warnings - non-blocking)

## 🔍 Identified Issues & Recommendations

### 1. **Environment Variables** ⚠️ CRITICAL
**Issue:** `.env.local` contains sensitive API keys that are committed or exposed.

**Required Environment Variables for Deployment:**
```bash
# Server-side only (DO NOT prefix with NEXT_PUBLIC_)
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_huggingface_key
PERPLEXITY_API_KEY=your_perplexity_key (optional)
UPLOAD_MAX_BYTES=10485760 (optional, default 10MB)

# Client-side Firebase (NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
```

**Action:**
- ✅ Verify `.env.local` is in `.gitignore` (already present)
- ⚠️ Add all environment variables to your deployment platform (Vercel/AWS/etc.)
- ⚠️ Rotate any exposed API keys immediately if committed to git

### 2. **PDF Parsing Libraries** ⚠️ MEDIUM
**Issue:** `pdf-parse` fails with "pdfParse is not a function" (seen in logs)

**Current Status:**
- ✅ Fallback to `pdfjs-dist` is working
- ⚠️ `pdf-parse` import might have issues in serverless environments

**Action:**
- The app currently works with `pdfjs-dist` fallback
- Consider removing `pdf-parse` dependency if issues persist: `pnpm remove pdf-parse`
- Or fix the import by ensuring correct default export handling

### 3. **Console Logging** ℹ️ LOW
**Issue:** Heavy console logging in production (20+ occurrences)

**Files with excessive logging:**
- `utils/pdfUtils.ts`
- `services/textExtractionService.ts`
- `utils/huggingfaceClient.ts`
- `utils/docxGenerator.ts`

**Action:**
- Wrap debug logs in `if (process.env.NODE_ENV !== 'production')` checks
- Or replace with proper logging library (winston, pino)
- Keep error logs for debugging production issues

### 4. **ESLint Configuration** ⚠️ LOW
**Issue:** ESLint CLI warnings about deprecated options

**Warning Message:**
```
Invalid Options:
- Unknown options: useEslintrc, extensions
- 'extensions' has been removed.
```

**Action:**
- Update to ESLint flat config format or adjust Next.js ESLint integration
- Non-blocking for deployment but should be fixed for CI/CD

### 5. **File Upload Size Limits** ✅ CONFIGURED
**Status:** 
- Default: 10MB (`UPLOAD_MAX_BYTES`)
- Configured in `app/api/analyze-document/route.ts`
- Vercel function max duration: 60s

**Recommendation:**
- For large PDFs, consider increasing timeout or implementing streaming upload
- Current limits are reasonable for legal documents

### 6. **Runtime Configuration** ✅ CORRECT
**Status:**
- All API routes properly set `export const runtime = "nodejs"`
- `vercel.json` configured with correct runtime and memory settings
- Server Components vs Client Components properly separated

### 7. **TypeScript Configuration** ⚠️ MEDIUM
**Issue:** Using TypeScript prerelease (6.0.0-dev.20251023)

**Recommendation:**
- Consider downgrading to stable TypeScript 5.x for production
- Or ensure deployment platform supports the prerelease version
- Current setup: Works but may have unexpected behaviors

### 8. **Dependency Vulnerabilities** ❓ UNKNOWN
**Action Required:**
```powershell
pnpm audit
```

Run this to check for security vulnerabilities in dependencies.

### 9. **API Rate Limiting** ⚠️ MEDIUM
**Issue:** No rate limiting on AI API endpoints

**Affected Routes:**
- `/api/analyze-document` - Heavy AI usage
- `/api/gemini` - Gemini API calls
- `/api/chat` - Chat completions

**Recommendation:**
- Implement rate limiting middleware
- Add API key validation for production
- Consider implementing usage quotas per user

### 10. **Error Handling** ⚠️ MEDIUM
**Issue:** Some API routes may expose detailed error messages

**Files to review:**
- `app/api/analyze-document/route.ts`
- `app/api/gemini/route.ts`
- `utils/huggingfaceClient.ts`

**Action:**
- Sanitize error messages for production
- Don't expose internal paths or API keys in errors
- Log full errors server-side but return generic messages to client

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured on deployment platform
- [ ] API keys rotated if exposed in git history
- [ ] Run `pnpm audit` and fix critical vulnerabilities
- [ ] Test full document upload → analysis flow on staging
- [ ] Verify Firebase authentication works in production domain
- [ ] Set up monitoring/logging (Sentry, LogRocket, etc.)
- [ ] Configure custom domain SSL certificates
- [ ] Set up CORS policies for production domain
- [ ] Test all AI features with production API keys
- [ ] Verify file upload/download works in production
- [ ] Load test analyze-document endpoint with concurrent users
- [ ] Set up automated backups for Firebase data
- [ ] Configure Vercel edge caching for static assets
- [ ] Review and minimize bundle sizes (currently analyze-report is 331 kB)

## 🚀 Deployment Commands

**Development:**
```powershell
pnpm dev
```

**Production Build:**
```powershell
pnpm build
pnpm start
```

**Type Check:**
```powershell
pnpm exec tsc --noEmit
```

**Lint:**
```powershell
pnpm lint
```

## 📊 Build Output Analysis

**Route Sizes:**
- `/` - 253 kB (main page)
- `/analyze-report` - **331 kB** ⚠️ (largest - consider code splitting)
- `/chatbot` - 262 kB
- Other pages - 146-224 kB

**Recommendation:**
- Consider lazy loading heavy components in analyze-report
- Use Next.js dynamic imports for PDF viewer/analysis UI
- Split analysis results into separate components

## 🔐 Security Considerations

1. **API Keys:** All sensitive keys should be server-side only (no NEXT_PUBLIC_ prefix)
2. **File Uploads:** Already protected with 10MB limit and file type validation
3. **CORS:** Currently wide open (`Access-Control-Allow-Origin: *`) - restrict in production
4. **Firebase Rules:** Ensure Firestore security rules are properly configured
5. **Rate Limiting:** Not implemented - add before production launch
6. **Input Validation:** Verify all user inputs are sanitized (especially file names)

## 📝 Notes

- Build completed successfully with minor linting warnings
- No TypeScript errors detected
- All critical API routes configured correctly
- Main concern: Environment variable management and PDF parsing library reliability
