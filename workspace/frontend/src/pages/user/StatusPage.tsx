import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Truck, FileText } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';
import * as api from '../../services/cleanconnectApi';

export function StatusPage() {
  const navigate = useNavigate();
  const { state, setComplaints, setPickupRequests, addPoints } = useAppContext();
  const [activeTab, setActiveTab] = useState<'complaints' | 'pickups'>('complaints');

  const handleAdvanceComplaint = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Resolved') return;
    try {
      const updated = await api.advanceComplaintStatus(id);
      setComplaints(prev => prev.map(c => 
        c.id === id ? { ...c, status: updated.status } : c
      ));
      
      if (updated.status === 'Resolved') {
        addPoints(25, 'Complaint resolved');
      }
    } catch (error) {
      console.error("Failed to advance complaint status:", error);
    }
  };

  const handleAdvancePickup = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Collected') return;
    try {
      const updated = await api.advancePickupStatus(id);
      setPickupRequests(prev => prev.map(p => 
        p.id === id ? { ...p, status: updated.status } : p
      ));
      
      if (updated.status === 'Collected') {
        addPoints(20, 'Waste collected');
      }
    } catch (error) {
      console.error("Failed to advance pickup status:", error);
    }
  };

  const ComplaintItem = ({ complaint }: { complaint: any }) => {
    const steps = ['Reported', 'Assigned', 'Resolved'];
    const currentStepIndex = steps.indexOf(complaint.status);

    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded mb-2">
              ID: {complaint.id.substring(0, 8)}
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-white capitalize">{complaint.category} Waste</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{complaint.description}</p>
          </div>
          <div className={`p-2 rounded-full ${
            complaint.status === 'Resolved' ? 'bg-green-100 text-green-600' : 
            complaint.status === 'Assigned' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
          }`}>
            {complaint.status === 'Resolved' ? <CheckCircle2 className="h-5 w-5" /> : 
             complaint.status === 'Assigned' ? <Clock className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded transition-all duration-500" 
               style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}></div>
          
          <div className="relative z-10 flex justify-between">
            {steps.map((step, idx) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  idx <= currentStepIndex 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}></div>
                <span className={`text-[10px] uppercase font-bold mt-1 ${
                  idx <= currentStepIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                }`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {complaint.status !== 'Resolved' && (
          <button 
            onClick={() => handleAdvanceComplaint(complaint.id, complaint.status)}
            className="mt-4 w-full py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            [Demo] Advance Status
          </button>
        )}
      </div>
    );
  };

  const PickupItem = ({ pickup }: { pickup: any }) => {
    const steps = ['Requested', 'Assigned', 'En Route', 'Collected'];
    const currentStepIndex = steps.indexOf(pickup.status);

    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded mb-2">
              PICKUP ID: {pickup.id.substring(0, 8)}
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-white capitalize">Team: {pickup.team_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Requested: {new Date(pickup.created_at || new Date()).toLocaleDateString()}</p>
          </div>
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded transition-all duration-500" 
               style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}></div>
          
          <div className="relative z-10 flex justify-between">
            {steps.map((step, idx) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  idx <= currentStepIndex 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}></div>
                <span className={`text-[10px] uppercase font-bold mt-1 ${
                  idx <= currentStepIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {pickup.status !== 'Collected' && (
          <button 
            onClick={() => handleAdvancePickup(pickup.id, pickup.status)}
            className="mt-4 w-full py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            [Demo] Advance Status
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Track Status</h1>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors ${
              activeTab === 'complaints' 
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            My Complaints
          </button>
          <button
            onClick={() => setActiveTab('pickups')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors ${
              activeTab === 'pickups' 
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Truck className="h-4 w-4" />
            My Pickups
          </button>
        </div>

        {activeTab === 'complaints' ? (
          <div>
            {state.complaints.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No complaints filed yet.</p>
              </div>
            ) : (
              state.complaints.map(complaint => (
                <ComplaintItem key={complaint.id} complaint={complaint} />
              ))
            )}
          </div>
        ) : (
          <div>
            {state.pickupRequests.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Truck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No pickup requests yet.</p>
              </div>
            ) : (
              state.pickupRequests.map(pickup => (
                <PickupItem key={pickup.id} pickup={pickup} />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
