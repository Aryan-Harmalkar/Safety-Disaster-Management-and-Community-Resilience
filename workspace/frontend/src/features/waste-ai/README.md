# waste-ai (CleanConnect Feature)

Integrated Gemini 2.5 Flash Vision AI layer for waste classification, contamination assessment, and stream routing.

## Files (`src/features/waste-ai`)

- [`types.ts`](./types.ts) — Detection contracts, item types, and categories.
- [`geminiVision.ts`](./geminiVision.ts) — Gemini 2.5 Flash REST integration, response sanitization, and direct multi-object vision detection.
- [`boxUtils.ts`](./boxUtils.ts) — Safe `box_2d` coordinate normalization [ymin, xmin, ymax, xmax] → CSS% & category color mapping.
- [`fileUtils.ts`](./fileUtils.ts) — File to Base64 utility with automatic downscaling for large camera uploads.
- [`WasteDetector.tsx`](./WasteDetector.tsx) — Production component with interactive bounding boxes, contamination badges, action buttons ("Report Waste", "Find Facility"), and CleanConnect points rewards (+20 pts).
- [`index.ts`](./index.ts) — Public feature export.

## Integration Points

1. **Dedicated Page**: [`WasteScannerPage.tsx`](../../pages/user/WasteScannerPage.tsx) accessible from `/user/scan`.
2. **Navigation**: Linked as "AI Scanner" in [`Navbar.tsx`](../../components/Layout/Navbar.tsx).
3. **User Dashboard**: Highlighted with a feature banner and Quick Action button in [`UserDashboard.tsx`](../../pages/user/UserDashboard.tsx).
4. **Complaint Workflow**: Direct link from [`ComplaintPage.tsx`](../../pages/user/ComplaintPage.tsx) to auto-detect items and prefill complaint forms.
