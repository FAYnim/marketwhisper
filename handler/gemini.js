// Frontend: tidak perlu API key lagi
async function callAI(inputContent) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputContent }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Gagal memanggil AI');
  }

  const { output } = await response.json();
  return output;
}

// Make function globally accessible
window.callAI = callAI;
