import { useCleanConnect } from '../hooks/useCleanConnect';
import { Header } from '../components/Header/Header';
import { GoaMap } from '../components/Map/GoaMap';
import { ComplaintForm } from '../components/Complaint/ComplaintForm';
import { FacilityAndPickup } from '../components/Pickup/FacilityAndPickup';
import { StatusSimulation } from '../components/Status/StatusSimulation';
import { DashboardAndLeaderboard } from '../components/Dashboard/DashboardAndLeaderboard';
import { BellRing } from 'lucide-react';

export function App() {
  const {
    citizenName,
    setCitizenName,
    points,
    pointHistory,
    tierInfo,
    selectedLocation,
    locationMode,
    setLocationMode,
    isLocating,
    locationError,
    fetchLiveLocation,
    setManualLocation,
    complaints,
    pickupRequests,
    lastClassification,
    nearestFacility,
    isSubmitting,
    isRequestingPickup,
    statusActionId,
    submitComplaint,
    requestPickup,
    advanceComplaint,
    advancePickup,
    liveAnnouncement,
  } = useCleanConnect();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Accessible Banner & Navigation */}
      <Header
        points={points}
        tierBadge={tierInfo.tierBadge}
        tier={tierInfo.tier}
        liveAnnouncement={liveAnnouncement}
      />

      {/* 2. Main Content Landmark */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 outline-none">
        
        {/* Dynamic aria-live notification toast / status banner */}
        <div
          aria-live="polite"
          className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="font-medium">{liveAnnouncement}</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            API: http://localhost:8000
          </span>
        </div>

        {/* Feature 1: Home / Map View */}
        <GoaMap
          selectedLocation={selectedLocation}
          locationMode={locationMode}
          setLocationMode={setLocationMode}
          isLocating={isLocating}
          locationError={locationError}
          onLiveLocationClick={fetchLiveLocation}
          onManualLocationSelect={setManualLocation}
          complaints={complaints}
          pickupRequests={pickupRequests}
          nearestFacility={nearestFacility}
        />

        {/* Two-column responsive grid: Feature 2 (Complaint) & Feature 3 (Facility/Pickup) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Feature 2: File a Complaint */}
          <ComplaintForm
            selectedLocation={selectedLocation}
            isSubmitting={isSubmitting}
            onSubmit={submitComplaint}
            lastClassification={lastClassification}
          />

          {/* Feature 3: Nearest Facility & Request Pickup */}
          <FacilityAndPickup
            nearestFacility={nearestFacility}
            activeCategory={lastClassification?.category ?? null}
            isRequestingPickup={isRequestingPickup}
            onRequestPickup={requestPickup}
            pickupRequests={pickupRequests}
          />
        </div>

        {/* Feature 4: Live Status Simulation */}
        <StatusSimulation
          complaints={complaints}
          pickupRequests={pickupRequests}
          onAdvanceComplaint={advanceComplaint}
          onAdvancePickup={advancePickup}
          actionLoadingId={statusActionId}
        />

        {/* Feature 5: Minimal Dashboard + Static Leaderboard */}
        <DashboardAndLeaderboard
          citizenName={citizenName}
          setCitizenName={setCitizenName}
          points={points}
          tierInfo={tierInfo}
          pointHistory={pointHistory}
        />
      </main>

      {/* Semantic Footer Landmark */}
      <footer role="contentinfo" className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            CleanConnect Goa — Civic Waste Management &amp; Community Resilience Demo
          </p>
          <p className="text-[11px]">
            Compliant with Web Content Accessibility Guidelines (WCAG 2.1 AA) • OpenStreetMap Tiles • React 19 • Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
