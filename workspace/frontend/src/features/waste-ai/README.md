# waste-ai (CleanConnect Feature)

Integrated Gemini 2.0 Flash Vision AI layer for waste classification, contamination assessment, and stream routing.

## Files (`src/features/waste-ai`)

- [`types.ts`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/types.ts) — Detection contracts, item types, and categories.
- [`geminiVision.ts`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/geminiVision.ts) — Gemini 2.0 Flash REST integration, response sanitization, and direct multi-object vision detection.
- [`boxUtils.ts`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/boxUtils.ts) — Safe `box_2d` coordinate normalization [ymin, xmin, ymax, xmax] → CSS% & category color mapping.
- [`fileUtils.ts`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/fileUtils.ts) — File to Base64 utility.
- [`WasteDetector.tsx`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/WasteDetector.tsx) — Production component with interactive bounding boxes, contamination badges, action buttons ("Report Waste", "Find Facility"), and CleanConnect points rewards (+20 pts).
- [`index.ts`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/features/waste-ai/index.ts) — Public feature export.

## Integration Points

1. **Dedicated Page**: [`/user/scan`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/pages/user/WasteScannerPage.tsx) accessible from top navigation and dashboard.
2. **Navigation**: Linked as "AI Scanner" in [`Navbar.tsx`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/components/Layout/Navbar.tsx).
3. **User Dashboard**: Highlighted with a feature banner and Quick Action button in [`UserDashboard.tsx`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/pages/user/UserDashboard.tsx).
4. **Complaint Workflow**: Direct link from [`ComplaintPage.tsx`](file:///home/hypokoto/dev/projects/Hackathon/Safety-Disaster-Management-and-Community-Resilience/workspace/frontend/src/pages/user/ComplaintPage.tsx) to auto-detect items and prefill complaint forms.
