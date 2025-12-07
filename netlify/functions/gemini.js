import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";


const moduleUrl = typeof import.meta !== "undefined" && import.meta.url ? import.meta.url : null;
const currentDir = moduleUrl ? path.dirname(fileURLToPath(moduleUrl)) : (typeof __dirname !== "undefined" ? __dirname : process.cwd());

const functionDirInstructions = path.resolve(currentDir, "..", "..", "assets", "instructions");
const projectRootInstructions = path.resolve(process.cwd(), "assets", "instructions");
const baseInstruction = `
Anda adalah asisten AI untuk UMKM di Indonesia. Jawab SELALU dalam Bahasa Indonesia.
Formatkan jawaban sebagai JSON dengan struktur:
{
  "ide_konten": [
    {
      "hook": string,
      "format": string,
      "visual": string,
      "cta": string
    }, ... (3-4 item)
  ]
}
Tidak perlu penjelasan lain di luar JSON.`;

async function loadInstructionsFile(instructionsFile) {
  if (!instructionsFile) return "";
  if (typeof instructionsFile !== "string") {
    throw new Error("instructionsFile harus berupa string");
  }

  const safeName = path.basename(instructionsFile);
  const candidatePaths = [
    path.join(functionDirInstructions, safeName),
    path.join(projectRootInstructions, safeName)
  ];

  for (const filePath of candidatePaths) {
    try {
      return await readFile(filePath, "utf8");
    } catch (_err) {
      // Try next path
    }
  }

  throw new Error("File instruksi tidak ditemukan");
}

function mapInstructionFile(contentGoal) {
  const map = {
    jualan: "promosi-jualan-harian.md",
    brand_awareness: "brand-awareness.md",
    brand_awarness: "brand-awareness.md", // handle possible typo
    edukasi: "edukasi.md",
    testimoni: "review.md",
    behind_scene: "bts.md",
    caption: "caption.md"
  };

  return map[contentGoal] || "promosi-jualan-harian.md";
}

export async function handler(event) {
  const { GoogleGenAI } = await import("@google/genai");

  try {
    const { prompt, instructionsFile, contentGoal } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt tidak boleh kosong" })
      };
    }

    let instructionsText = "";
    try {
      const resolvedFile = instructionsFile || mapInstructionFile(contentGoal);
      instructionsText = await loadInstructionsFile(resolvedFile);
    } catch (readError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: readError.message })
      };
    }

    let ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const systemInstruction = [
      baseInstruction,
      instructionsText ? "Instruksi konten (markdown):\n" + instructionsText : ""
    ].filter(Boolean).join("\n\n");

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction
        }
      });

      const output =
        result.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output })
      };
    } catch (aiError) {
      // Cek kuota api habis atau nggak (429)
      if (aiError.message && aiError.message.includes('429') || 
          aiError.message && aiError.message.includes('quota') ||
          aiError.message && aiError.message.includes('RESOURCE_EXHAUSTED')) {
        
        console.log('AI Limit: Free tier quota exceeded, switching to production API key');
        
        ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY_PROD
        });

        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction
          }
        });

        const output =
          result.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            output, 
            warning: "Switched to production API key due to free tier quota exceeded" 
          })
        };
      } else {
        throw aiError;
      }
    }
  } catch (err) {
    console.log('AI Limit: Error occurred -', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}