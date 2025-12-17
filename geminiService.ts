
import { GoogleGenAI } from "@google/genai";

export async function generateAOPMockup(
  patternBase64: string,
  garmentType: string,
  modelDescription: string,
  baseModelImageBase64?: string | null
): Promise<{ flatImage: string; modelImage: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const modelName = 'gemini-2.5-flash-image';

  // 1. Generate Flat Garment Image (Studio shot)
  const flatPrompt = `A high-resolution, professional studio product photography of a ${garmentType} lying flat on a pure white background. The fabric of the entire ${garmentType} is 100% covered by the pattern provided in the image (All-Over Print / AOP). The print is seamless, vibrant, and covers the front, sleeves, and collar. Sharp focus, realistic fabric weave texture, clean edges.`;
  
  const flatResponse = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { data: patternBase64.split(',')[1] || patternBase64, mimeType: 'image/png' } },
        { text: flatPrompt }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  let flatImage = "";
  for (const part of flatResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      flatImage = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  // 2. Generate Model Image (The Fusion part)
  const contents: any[] = [
    { inlineData: { data: patternBase64.split(',')[1] || patternBase64, mimeType: 'image/png' } }
  ];

  let modelDetailedPrompt = "";

  if (baseModelImageBase64) {
    // CRITICAL: We pass the person's image as the second part
    contents.push({ inlineData: { data: baseModelImageBase64.split(',')[1] || baseModelImageBase64, mimeType: 'image/png' } });
    
    // This prompt is designed to act as a "Neural Texture Transfer" instruction
    modelDetailedPrompt = `
      ULTRA-REALISTIC CLOTHING REPLACEMENT TASK.
      
      REFERENCE 1 (Pattern): The texture/design to be applied.
      REFERENCE 2 (Person): The model, pose, and background to preserve.

      INSTRUCTION:
      Create a photorealistic image that is IDENTICAL to the second image in every way (same person, same face, same hair, same pose, same background, same lighting) EXCEPT for the garment.
      Replace the current clothing worn by the person with a ${garmentType} made ENTIRELY from the fabric design in the first image.
      
      RULES:
      1. ALL-OVER PRINT (AOP): The pattern must cover 100% of the ${garmentType}, including sleeves, seams, hood (if hoodie), and edges. 
      2. PHYSICAL ACCURACY: The pattern must wrap around the body curves, follow the exact wrinkles, folds, and shadows of the garment in the original photo.
      3. SEAMLESS: The transition between the person's skin and the new garment must be perfect.
      4. ${modelDescription ? `ADDITIONAL STYLE: ${modelDescription}` : "Maintain high-end fashion photography quality."}

      The output MUST look like the person in the photo is actually wearing this custom-printed garment.
    `;
  } else {
    // If no person is uploaded, generate a new one from scratch
    const personContext = modelDescription || "a high-fashion model in a professional studio";
    modelDetailedPrompt = `A high-end fashion editorial photography of ${personContext} wearing a custom ${garmentType}. The garment is 100% covered in an all-over print using the design from the first image. The print wraps realistically around the torso and sleeves, following body anatomy and fabric creases. Cinematic lighting, 8k resolution, photorealistic fashion mockup.`;
  }

  contents.push({ text: modelDetailedPrompt });

  const modelResponse = await ai.models.generateContent({
    model: modelName,
    contents: { parts: contents },
    config: {
      imageConfig: { aspectRatio: "3:4" }
    }
  });

  let modelImage = "";
  for (const part of modelResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      modelImage = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { flatImage, modelImage };
}
