import fs from 'fs';
(async function(){
  try{
    const envPath = new URL('../.env.local', import.meta.url);
    const raw = fs.readFileSync(envPath, 'utf8');
    const m = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)\s*$/m);
    if(!m){
      console.error('GEMINI_API_KEY not found in .env.local');
      process.exit(2);
    }
    const key = m[1].trim();
    // strip surrounding quotes if present
    const cleaned = key.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const client = new GoogleGenerativeAI(cleaned);
    if(typeof client.listModels !== 'function'){
      console.error('listModels not available on client');
      process.exit(3);
    }
    const res = await client.listModels();
    // Print a compact preview
    console.log(JSON.stringify(res, null, 2).slice(0, 10000));
  }catch(err){
    console.error('error:', err);
    process.exit(1);
  }
})();
