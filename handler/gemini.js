// Frontend: tidak perlu API key lagi
async function callAI(prompt, instructionsFile, contentGoal) {
  const body = { prompt };
  if (instructionsFile) body.instructionsFile = instructionsFile; // Optional override
  if (contentGoal) body.contentGoal = contentGoal; // Backend will map if no file provided

  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
