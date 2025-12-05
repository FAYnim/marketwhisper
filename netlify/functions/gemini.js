export async function handler(event) {
  const { GoogleGenAI } = await import("@google/genai");

  try {
    const { inputContent } = JSON.parse(event.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: inputContent }] }]
    });

    const output =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ output })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}