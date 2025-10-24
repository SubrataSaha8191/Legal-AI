import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3001/api/learn-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Contract Law', type: 'content' })
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

test().catch(err => console.error(err));
