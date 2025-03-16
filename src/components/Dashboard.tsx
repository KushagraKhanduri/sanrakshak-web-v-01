
import React, { useState, useEffect, useCallback } from 'react';
import VictimDashboard from './dashboards/VictimDashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';
import NGODashboard from './dashboards/NGODashboard';
import GovernmentDashboard from './dashboards/GovernmentDashboard';
import { Info, Map, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedTransition from './AnimatedTransition';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useResourceData from '@/hooks/useResourceData';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'updates' | 'map'>('resources');
  const [userRole, setUserRole] = useState<'victim' | 'volunteer' | 'ngo' | 'government' | null>(null);
  const [dashboardKey, setDashboardKey] = useState(Date.now());
  const resourceData = useResourceData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const fetchUserRole = useCallback(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      setUserRole(user.role);
      console.info('Rendering dashboard for role:', user.role);
      
      // We'll keep this commented out as we want to stay on the dashboard page
      // and not redirect to resources pages
      
      /* 
      // Redirect to appropriate resource page based on role
      if (user.role === 'victim') {
        navigate('/victim-resources');
      } else if (['volunteer', 'ngo', 'government'].includes(user.role)) {
        navigate('/volunteer-resources');
      }
      */
    } else {
      // Default to victim view for unauthenticated users
      setUserRole('victim');
      console.warn('No role specified, defaulting to Victim dashboard');
    }
  }, [navigate]);
  
  useEffect(() => {
    // Get current user from localStorage
    fetchUserRole();
    
    // Setup event listener for auth changes
    const handleAuthChange = () => {
      fetchUserRole();
      setDashboardKey(Date.now()); // Force re-render
    };
    
    // Force refresh when the refresh param changes in URL
    const refreshParam = searchParams.get('refresh');
    if (refreshParam) {
      setDashboardKey(parseInt(refreshParam));
    }
    
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('role-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('role-changed', handleAuthChange);
    };
  }, [fetchUserRole, searchParams]);
  
  // Listen for resource updates to refresh data across components
  useEffect(() => {
    const handleResourceUpdate = () => {
      // This will trigger a refresh in the resourceData hook
      window.dispatchEvent(new Event('resource-updated'));
      console.log('Resource updated in Dashboard component');
    };
    
    window.addEventListener('resource-created', handleResourceUpdate);
    window.addEventListener('response-created', handleResourceUpdate);
    window.addEventListener('response-updated', handleResourceUpdate);
    
    return () => {
      window.removeEventListener('resource-created', handleResourceUpdate);
      window.removeEventListener('response-created', handleResourceUpdate);
      window.removeEventListener('response-updated', handleResourceUpdate);
    };
  }, []);
  
  // Show emergency alert for all users
  const EmergencyAlert = () => (
    <div className="mb-6">
      <AnimatedTransition>
        <div className="relative overflow-hidden glass-dark rounded-xl border border-black/20 p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center rounded-full bg-white/10 border border-black/10 px-2.5 py-1 text-xs shadow-sm">
              <Zap size={12} className="mr-1" />
              <span>Critical</span>
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <div className="mb-2">
                <h2 className="text-xl font-semibold">Hurricane Warning: Category 3</h2>
              </div>
              <p className="text-black font-medium text-sm mb-3">
                Evacuation orders in effect for coastal areas. Shelters are open at Central High School and Community Center.
              </p>
              <div className="flex items-center text-xs text-black font-medium">
                <Info size={12} className="mr-1" />
                <span>Updated 30 minutes ago from National Weather Service</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link to="/emergency-plan" className="px-4 py-2 rounded-full text-sm bg-white text-black hover:bg-white/90 transition-colors border border-black/10 shadow-sm">
                Emergency Plan
              </Link>
              <Link to="/shelter-map" className="px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/15 transition-colors border border-black/10 shadow-sm">
                Shelter Map
              </Link>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    </div>
  );
  
  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'victim':
        return <VictimDashboard key={dashboardKey} resourceData={resourceData} />;
      case 'volunteer':
        return <VolunteerDashboard key={dashboardKey} resourceData={resourceData} />;
      case 'ngo':
        return <NGODashboard key={dashboardKey} resourceData={resourceData} />;
      case 'government':
        return <GovernmentDashboard key={dashboardKey} resourceData={resourceData} />;
      default:
        return <VictimDashboard key={dashboardKey} resourceData={resourceData} />;
    }
  };
  
  return (
    <div className="container mx-auto px-4">
      <EmergencyAlert />
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;
