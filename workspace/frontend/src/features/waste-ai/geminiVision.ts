import type { WasteItem, DetectionResult } from "./types";

const MODEL = "gemini-2.5-flash";

const PROMPT = `You are a waste-sorting vision system. Detect every distinct waste item visible in the image.

For each item, return an object with exactly these fields:
- box_2d: [ymin, xmin, ymax, xmax], normalized 0-1000 (NOT pixel coordinates)
- label: short item name (e.g. "plastic bottle", "tin can")
- category: one of "Plastic","Metal","Glass","Paper","Electronic","Hazardous","Organic","Other"
- confidence: number 0-1, your certainty in this classification
- is_contaminated: true if the item shows grease, food residue, liquid, or mixed material that would cause a recycling facility to reject it
- contaminant_type: short description if contaminated (e.g. "grease", "liquid pooling"), else null
- reason: one sentence justifying the contamination call
- disposal_stream: the correct bin/stream for this item given its category and contamination state (e.g. "recycling - plastics", "hazardous waste - do not recycle", "general waste - contaminated")

Return ONLY a JSON array of these objects. No markdown fences, no prose, no explanation outside the array.`;

/** Strips the data: URL prefix off a base64 string, if present. */
export function stripDataUrlPrefix(base64: string): string {
  const commaIdx = base64.indexOf(",");
  return commaIdx === -1 ? base64 : base64.slice(commaIdx + 1);
}

/** Get active Gemini API key from Vite env or user input */
export function getActiveApiKey(): string {
  const envKey = ((import.meta.env.VITE_GEMINI_API_KEY as string) || "").trim();
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem("VITE_GEMINI_API_KEY");
    if (customKey && !customKey.startsWith("AIzaSy")) {
      localStorage.removeItem("VITE_GEMINI_API_KEY");
    } else if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }
  return envKey;
}

/** Save a user-provided Gemini API key to localStorage */
export function setActiveApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("VITE_GEMINI_API_KEY", key.trim());
    } else {
      localStorage.removeItem("VITE_GEMINI_API_KEY");
    }
  }
}

/** Cleans possible Markdown formatting or extra text from the LLM output */
function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  const startArr = cleaned.indexOf("[");
  const endArr = cleaned.lastIndexOf("]");
  if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
    return cleaned.substring(startArr, endArr + 1);
  }
  const startObj = cleaned.indexOf("{");
  const endObj = cleaned.lastIndexOf("}");
  if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
    return cleaned.substring(startObj, endObj + 1);
  }
  return cleaned;
}

export async function detectWaste(
  base64Image: string,
  mimeType: string,
  customApiKey?: string
): Promise<DetectionResult> {
  const apiKey = (customApiKey || getActiveApiKey()).trim();

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key — please configure VITE_GEMINI_API_KEY in .env or enter your key in settings."
    );
  }

  const apiPath = `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Primary endpoint: uses Vite proxy (/gemini-api) to prevent browser CORS and adblocker issues
  const primaryEndpoint = isLocalhost
    ? `/gemini-api${apiPath}`
    : `https://generativelanguage.googleapis.com${apiPath}`;
  const directEndpoint = `https://generativelanguage.googleapis.com${apiPath}`;

  const started = performance.now();

  const payload = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: stripDataUrlPrefix(base64Image),
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  let res: Response;
  try {
    res = await fetch(primaryEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // If local proxy was not found (404), fall back to direct Google endpoint
    if (res.status === 404 && primaryEndpoint !== directEndpoint) {
      res = await fetch(directEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (netErr: any) {
    if (primaryEndpoint !== directEndpoint) {
      try {
        res = await fetch(directEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        throw new Error(
          `Network connection error: Unable to reach Gemini API. Please check your browser connection (${netErr?.message || "fetch failed"}).`
        );
      }
    } else {
      throw new Error(
        `Network connection error: Unable to reach Gemini API (${netErr?.message || "fetch failed"}).`
      );
    }
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    let errorDetail = errorBody;
    try {
      const parsedError = JSON.parse(errorBody);
      if (parsedError?.error?.message) {
        errorDetail = parsedError.error.message;
      }
    } catch {
      // Keep raw body
    }
    throw new Error(`Gemini API error (${res.status}): ${errorDetail}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty content. Please try another image.");
  }

  const cleaned = cleanJsonText(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini response was not valid JSON:\n" + text);
  }

  const items: WasteItem[] = Array.isArray(parsed)
    ? (parsed as WasteItem[])
    : ((parsed as { items?: WasteItem[] })?.items ?? []);

  return {
    items,
    rawLatencyMs: Math.round(performance.now() - started),
  };
}
