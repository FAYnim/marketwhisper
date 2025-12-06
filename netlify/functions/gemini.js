import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const functionDirInstructions = path.resolve(__dirname, "..", "..", "assets", "instructions");
const projectRootInstructions = path.resolve(process.cwd(), "assets", "instructions");

// Base system-style instruction to keep responses structured for easy parsing.
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

// Map tujuan konten ke file instruksi markdown
function mapInstructionFile(contentGoal) {
  const map = {
    jualan: "promosi-jualan-harian.md",
    brand_awareness: "brand-awareness.md",
    brand_awarness: "brand-awareness.md", // handle possible typo
    edukasi: "edukasi.md",
    testimoni: "review.md",
    behind_scene: "bts.md"
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

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const systemInstruction = [
      baseInstruction,
      instructionsText ? "Instruksi konten (markdown):\n" + instructionsText : ""
    ].filter(Boolean).join("\n\n");

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
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}