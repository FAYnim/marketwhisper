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
    
    // Check if error contains quota exceeded information
    if (error && (error.includes('429') || error.includes('quota') || error.includes('RESOURCE_EXHAUSTED'))) {
      console.log('AI Limit: Free tier quota exceeded, system automatically switched to production API');
    }
    
    throw new Error(error || 'Gagal memanggil AI');
  }

  const { output, warning } = await response.json();
  
  // Log if production API key was used
  if (warning) {
    console.log('AI Limit:', warning);
  }
  
  return output;
}

// Make function globally accessible
window.callAI = callAI;
