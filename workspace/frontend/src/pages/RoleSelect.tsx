import { useNavigate } from 'react-router-dom';
import { Recycle, User, Truck } from 'lucide-react';

export function RoleSelect() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'user' | 'collector') => {
    localStorage.setItem('cleanconnect_role', role); // Optional persistence
    navigate(`/${role}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Recycle className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">CleanConnect</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Waste Management & Citizen Engagement &mdash; Goa, India
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <button
          onClick={() => handleRoleSelect('user')}
          className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 focus:ring-4 focus:ring-emerald-300 outline-none"
        >
          <User className="h-16 w-16 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Login as Citizen</h2>
          <p className="text-emerald-50 text-center text-sm md:text-base">
            File complaints, track waste, earn eco-points
          </p>
        </button>

        <button
          onClick={() => handleRoleSelect('collector')}
          className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 outline-none"
        >
          <Truck className="h-16 w-16 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Login as Garbage Collector</h2>
          <p className="text-blue-50 text-center text-sm md:text-base">
            Manage pickups, update collection status
          </p>
        </button>
      </div>
    </main>
  );
}
