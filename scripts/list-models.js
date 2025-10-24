import('dotenv/config');
(async function(){
  try{
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    if(typeof client.listModels !== 'function'){
      console.error('listModels not available on client');
      return;
    }
    const res = await client.listModels();
    console.log('models:', JSON.stringify(res, null, 2).slice(0,2000));
  }catch(err){
    console.error('error:', err);
  }
})();
