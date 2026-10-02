export type WasteCategory =
  | "Plastic"
  | "Metal"
  | "Glass"
  | "Paper"
  | "Electronic"
  | "Hazardous"
  | "Organic"
  | "Other";

export interface WasteItem {
  /** [ymin, xmin, ymax, xmax] — normalized 0-1000. NOT pixel coords. */
  box_2d: [number, number, number, number];
  label: string;
  category: WasteCategory;
  confidence: number; // 0-1
  is_contaminated: boolean;
  contaminant_type: string | null;
  reason: string;
  disposal_stream: string;
}

export interface DetectionResult {
  items: WasteItem[];
  rawLatencyMs: number;
}
