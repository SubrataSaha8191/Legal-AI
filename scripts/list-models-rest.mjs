import fs from 'fs';
import { URL } from 'url';

(async function(){
  try{
    const envPath = new URL('../.env.local', import.meta.url);
    const raw = fs.readFileSync(envPath, 'utf8');
    const m = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)\s*$/m);
    if(!m){
      console.error('GEMINI_API_KEY not found in .env.local');
      process.exit(2);
    }
    const key = m[1].trim().replace(/^"|"$/g,'').replace(/^'|'$/g,'');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    console.log('Fetching models from', endpoint);

    const res = await fetch(endpoint, { method: 'GET' });
    const body = await res.text();
    console.log('Status:', res.status);
    try{
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
    }catch(e){
      console.log('Non-JSON response:', body.slice(0, 2000));
    }
  }catch(err){
    console.error('error:', err);
    process.exit(1);
  }
})();
