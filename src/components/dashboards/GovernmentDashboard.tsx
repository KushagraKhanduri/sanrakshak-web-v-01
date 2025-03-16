
import React, { useState, useEffect } from 'react';
import { BarChart, Building2, Users, FileText, AlertTriangle, UserCheck, Building } from 'lucide-react';
import StatusUpdate from '../StatusUpdate';
import AnimatedTransition from '../AnimatedTransition';
import { Link } from 'react-router-dom';
import useResourceData from '@/hooks/useResourceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfile from '../UserProfile';
import { Button } from '@/components/ui/button';
import RegisteredHelpersDialog from '../RegisteredHelpersDialog';
import { useTheme } from '@/context/ThemeProvider';

interface GovernmentDashboardProps {
  resourceData?: ReturnType<typeof useResourceData>;
}

const GovernmentDashboard: React.FC<GovernmentDashboardProps> = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [helperFilter, setHelperFilter] = useState<'all' | 'volunteer' | 'ngo'>('all');
  const [showAllHelpersDialog, setShowAllHelpersDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    // Get users from localStorage where they're stored during account creation
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        // Only include volunteers and NGOs and limit to 4 for the preview
        const helpersOnly = parsedUsers
          .filter((user: any) => user.role === 'volunteer' || user.role === 'ngo')
          .slice(0, 4);
        setUsers(helpersOnly);
      } catch (error) {
        console.error('Error parsing stored users:', error);
        // Fallback to sample users if error
        setUsers(getSampleUsers());
      }
    } else {
      // If no users found in localStorage, use sample data
      setUsers(getSampleUsers());
    }
  }, []);

  const getSampleUsers = () => {
    return [
      {
        id: "volunteer-1",
        name: "Sarah Johnson",
        role: "volunteer",
        contactInfo: "sarah.j@example.com",
        location: "Central District",
        lastActive: "2 hours ago",
        skills: ["First Aid", "Search & Rescue", "Logistics"]
      },
      {
        id: "ngo-1",
        name: "Red Cross Chapter",
        role: "ngo",
        contactInfo: "local@redcross.org",
        location: "Multiple Districts",
        lastActive: "30 minutes ago"
      },
      {
        id: "volunteer-2",
        name: "Michael Chen",
        role: "volunteer",
        contactInfo: "m.chen@example.com",
        location: "North District",
        lastActive: "4 hours ago",
        skills: ["Medical", "Transportation", "Communication"]
      },
      {
        id: "ngo-2",
        name: "Community Relief Foundation",
        role: "ngo",
        contactInfo: "help@crf.org",
        location: "South District",
        lastActive: "1 hour ago"
      }
    ];
  };
  
  const filteredUsers = users.filter(user => {
    if (helperFilter === 'all') return true;
    return user.role === helperFilter;
  });
  
  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <AnimatedTransition>
          <div className={`relative overflow-hidden rounded-xl border ${isLight ? 'border-gray-200 bg-white shadow-sm' : 'border-white/10 glass-dark'} p-4 sm:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 sm:mr-6">
                <div className="flex items-center mb-2">
                  <Building2 size={18} className="mr-2" />
                  <h2 className="text-xl font-semibold">Government Response Hub</h2>
                </div>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm mb-3`}>
                  Coordinate disaster response efforts, manage infrastructure recovery, and analyze impact assessments.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Link to="/command-center" className={`px-4 py-2 rounded-full text-sm ${isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'} transition-colors`}>
                  Command Center
                </Link>
                <Link to="/recovery-plan" className={`px-4 py-2 rounded-full text-sm ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-white/10 hover:bg-white/15 text-white'} transition-colors`}>
                  Recovery Plan
                </Link>
              </div>
            </div>
          </div>
        </AnimatedTransition>
      </div>
      
      <AnimatedTransition className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`flex items-center p-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} rounded-xl border`}>
            <div className={`${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10'} p-2 rounded-lg mr-4`}>
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h3 className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Active Incidents</h3>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
          
          <div className={`flex items-center p-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} rounded-xl border`}>
            <div className={`${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10'} p-2 rounded-lg mr-4`}>
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Affected Areas</h3>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
          
          <div className={`flex items-center p-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} rounded-xl border`}>
            <div className={`${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10'} p-2 rounded-lg mr-4`}>
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h3 className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>People Affected</h3>
              <p className="text-2xl font-semibold">5,483</p>
            </div>
          </div>
          
          <div className={`flex items-center p-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} rounded-xl border`}>
            <div className={`${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10'} p-2 rounded-lg mr-4`}>
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h3 className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Response Plans</h3>
              <p className="text-2xl font-semibold">7</p>
            </div>
          </div>
        </div>
      </AnimatedTransition>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedTransition delay={100} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <CardTitle className="flex items-center mb-4 sm:mb-0">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Registered Volunteers and NGOs
                </CardTitle>
                
                <div className="flex space-x-2">
                  <Button 
                    variant={helperFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setHelperFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={helperFilter === 'volunteer' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setHelperFilter('volunteer')}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Volunteers
                  </Button>
                  <Button 
                    variant={helperFilter === 'ngo' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setHelperFilter('ngo')}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    NGOs
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <UserProfile
                    key={user.id}
                    name={user.name}
                    role={user.role as 'volunteer' | 'ngo'}
                    contactInfo={user.contactInfo}
                    location={user.location}
                    lastActive={user.lastActive}
                    skills={user.role === 'volunteer' ? user.skills : undefined}
                    userId={user.id}
                  />
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-gray-400">
                    <AlertTriangle className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p>No {helperFilter === 'volunteer' ? 'volunteers' : 'NGOs'} found</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllHelpersDialog(true)}
                  className={`px-4 py-2 rounded-full text-sm ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-white/10 hover:bg-white/15 text-white'} transition-colors inline-block`}
                >
                  View All Registered Helpers
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedTransition>
        
        <div className="space-y-6">
          <AnimatedTransition delay={200}>
            <div className={`${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} border rounded-xl p-4`}>
              <h3 className="text-lg font-medium mb-4">Critical Alerts</h3>
              
              <div className="space-y-3">
                <StatusUpdate
                  id="govt-status-1"
                  title="Flooding in South District"
                  message="Water levels rising. Evacuation in progress. Emergency services deployed."
                  source="Emergency Management"
                  timestamp="35 minutes ago"
                  priority="high"
                />
                
                <StatusUpdate
                  id="govt-status-2"
                  title="Bridge Structural Issues"
                  message="Highway 95 bridge showing damage. Engineers dispatched. Avoid area."
                  source="Transportation Department"
                  timestamp="2 hours ago"
                  priority="high"
                />
              </div>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={250}>
            <div className={`${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'} border rounded-xl p-4`}>
              <h3 className="text-lg font-medium mb-4">Agency Coordination</h3>
              
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 border ${isLight ? 'border-gray-200 bg-white' : 'border-white/10'} rounded-lg`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Emergency Services</span>
                  </div>
                  <span className={`text-xs ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10'} px-2 py-0.5 rounded-full`}>Active</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 border ${isLight ? 'border-gray-200 bg-white' : 'border-white/10'} rounded-lg`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Public Health</span>
                  </div>
                  <span className={`text-xs ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10'} px-2 py-0.5 rounded-full`}>Active</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 border ${isLight ? 'border-gray-200 bg-white' : 'border-white/10'} rounded-lg`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Transportation</span>
                  </div>
                  <span className={`text-xs ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10'} px-2 py-0.5 rounded-full`}>Limited</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 border ${isLight ? 'border-gray-200 bg-white' : 'border-white/10'} rounded-lg`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Utilities</span>
                  </div>
                  <span className={`text-xs ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10'} px-2 py-0.5 rounded-full`}>Limited</span>
                </div>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </div>
      
      <RegisteredHelpersDialog 
        open={showAllHelpersDialog} 
        onOpenChange={setShowAllHelpersDialog} 
      />
    </div>
  );
};

export default GovernmentDashboard;
