// app/api/analyze-document/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import the main.js module (relative path) to ensure bundler compatibility
    let processLegalDocumentFromBuffer: any;
    try {
      const mod: any = await import('../../main.js');
      processLegalDocumentFromBuffer = mod.processLegalDocumentFromBuffer || (mod.default && mod.default.processLegalDocumentFromBuffer);
    } catch (e: any) {
      console.error('Failed to import app/main.js:', e?.stack || e?.message || e);
      return NextResponse.json({ success: false, error: 'Failed to load processing module (app/main.js). Check build logs and module path.' }, { status: 500 });
    }
    if (typeof processLegalDocumentFromBuffer !== 'function') {
      console.error('processLegalDocumentFromBuffer not exported from app/main.js');
      return NextResponse.json({ success: false, error: 'Processing function not found in app/main.js' }, { status: 500 });
    }

    // Process using main.js logic
    const results = await processLegalDocumentFromBuffer(buffer, file.name);

    // Return in a simple { success, data } envelope (UI normalizes)
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Analyze route error:', error?.stack || error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || 'Unexpected error in analyze-document route' }, { status: 500 });
  }
}
