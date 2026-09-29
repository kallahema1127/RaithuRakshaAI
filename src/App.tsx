import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { FarmerView } from './components/farmer/FarmerView';
import { RecipientView } from './components/recipient/RecipientView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  Sprout, 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  PhoneCall, 
  Info 
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
      {currentRole === 'farmer' && <FarmerView />}
      {currentRole === 'recipient' && <RecipientView />}
      {currentRole === 'admin' && <AdminDashboard />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
        <Navbar />
        <MainContent />

        {/* Informative Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-gray-800">
                AI Surplus Matcher for Rythu Bazaar (రైతు బజార్)
              </span>
              <span className="text-gray-400">&bull; Zero Vegetable Waste Initiative</span>
            </div>

            <div className="flex items-center gap-6 text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Govt. Rythu Bazaar Direct Farmer Network
              </span>
              <span>&bull;</span>
              <span>Mehdipatnam &bull; Erragadda &bull; Kukatpally</span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
