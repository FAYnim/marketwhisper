// Frontend: tidak perlu API key lagi
async function callAI(prompt, systemInstructionFile = null) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstructionFile }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Gagal memanggil AI');
  }

  const { result } = await response.json();
  return result;
}

// Make function globally accessible
window.callAI = callAI;