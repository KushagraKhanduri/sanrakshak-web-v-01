
import React, { useMemo, useState, useEffect } from 'react';
import { Info, ArrowRight } from 'lucide-react';
import ResourceCard from '../ResourceCard';
import StatusUpdate from '../StatusUpdate';
import EmergencyContact from '../EmergencyContact';
import LocationFinder from '../LocationFinder';
import AnimatedTransition from '../AnimatedTransition';
import { Link } from 'react-router-dom';
import useResourceData from '@/hooks/useResourceData';
import EmergencyContactsDialog from '../EmergencyContactsDialog';

interface VictimDashboardProps {
  resourceData?: ReturnType<typeof useResourceData>;
}

const VictimDashboard: React.FC<VictimDashboardProps> = ({ resourceData }) => {
  // Use passed resourceData or create a new instance
  const { resources, responses, loading } = resourceData || useResourceData();
  const [user, setUser] = useState<any>(null);
  const [showAllContacts, setShowAllContacts] = useState(false);
  
  // Get current user to check responses
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  // Get a set of all resource IDs that the current user has already responded to
  const respondedRequestIds = useMemo(() => {
    if (!user?.id) return new Set<string>();
    
    const userResponses = JSON.parse(localStorage.getItem(`responses_${user.id}`) || '[]');
    return new Set(userResponses.map((response: any) => response.requestId));
  }, [user, responses]);
  
  // Filter resources to only show offers (available to victims)
  const availableResources = useMemo(() => {
    return resources
      .filter(resource => resource.type === 'offer')
      .sort((a, b) => {
        // Sort by urgent first, then by timestamp (newest first)
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return b.timestamp - a.timestamp;
      })
      .slice(0, 4); // Only show the top 4
  }, [resources]);
  
  // Filter resources to show the victim's own requests
  const myRequests = useMemo(() => {
    if (!user?.id) return [];
    
    return resources
      .filter(resource => 
        resource.type === 'need' && 
        resource.userId === user.id
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 2); // Only show the top 2
  }, [resources, user]);
  
  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <AnimatedTransition>
          <div className="relative overflow-hidden glass-dark rounded-xl border border-white/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 sm:mr-6">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold">Need Help?</h2>
                </div>
                <p className="text-black font-medium text-sm mb-3">
                  Request emergency assistance, find shelter, or access resources. Our priority is keeping you safe.
                </p>
                <div className="flex items-center text-xs text-black font-medium">
                  <Info size={12} className="mr-1" />
                  <span>Your safety is our top priority</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link to="/resources" className="px-4 py-2 rounded-full text-sm bg-white text-black hover:bg-white/90 transition-colors">
                  Request Help
                </Link>
                <Link to="/shelter-map" className="px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/15 transition-colors">
                  Find Shelter
                </Link>
              </div>
            </div>
          </div>
        </AnimatedTransition>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedTransition className="mb-6" delay={100}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Resources</h2>
              <Link to="/resources" className="flex items-center text-sm text-black font-medium hover:text-black/80 transition-colors">
                <span className="mr-1">View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                // Show loading states
                Array(4).fill(0).map((_, index) => (
                  <div key={`loading-${index}`} className="animate-pulse rounded-xl p-6 bg-white/5 h-64"></div>
                ))
              ) : availableResources.length > 0 ? (
                // Show available resources
                availableResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    type="offer"
                    category={resource.category}
                    title={resource.title}
                    description={resource.description}
                    location={resource.location}
                    locationDetails={resource.locationDetails}
                    contact={resource.contact}
                    contactName={resource.contactName}
                    urgent={resource.urgent}
                    requestId={resource.id}
                    isRequested={user?.id && user.role === 'victim' && respondedRequestIds.has(resource.id)}
                  />
                ))
              ) : (
                // No resources available
                <div className="col-span-2 p-6 border border-white/10 rounded-xl text-center">
                  <p className="text-black font-medium">No resources available at the moment.</p>
                </div>
              )}
            </div>
          </AnimatedTransition>
          
          {/* Show My Request Section if user has requests */}
          {myRequests.length > 0 && (
            <AnimatedTransition className="mb-6" delay={150}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Requests</h2>
                <Link to="/victim-resources" className="flex items-center text-sm text-black font-medium hover:text-black/80 transition-colors">
                  <span className="mr-1">View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRequests.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    type="need"
                    category={resource.category}
                    title={resource.title}
                    description={resource.description}
                    location={resource.location}
                    contact={resource.contact}
                    urgent={resource.urgent}
                    requestId={resource.id}
                    isRequested={true} // Always mark as requested since these are the user's own requests
                  />
                ))}
              </div>
            </AnimatedTransition>
          )}
          
          <AnimatedTransition delay={200}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Status Updates</h2>
              <Link to="/alerts" className="flex items-center text-sm text-black font-medium hover:text-black/80 transition-colors">
                <span className="mr-1">View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              <StatusUpdate
                id="status-1"
                title="Power Restoration Progress"
                message="Crews are working to restore power to the eastern district. Estimated completion: 24 hours."
                source="City Power & Utilities"
                timestamp="1 hour ago"
                priority="high"
              />
              
              <StatusUpdate
                id="status-2"
                title="Road Closure Update"
                message="Main Street between 5th and 8th Ave remains flooded and closed to traffic. Use alternate routes."
                source="Department of Transportation"
                timestamp="3 hours ago"
                priority="medium"
              />
            </div>
          </AnimatedTransition>
        </div>
        
        <div>
          <AnimatedTransition className="mb-6" delay={150}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              <button 
                onClick={() => setShowAllContacts(true)}
                className="flex items-center text-sm text-black font-medium hover:text-black/80 transition-colors"
              >
                <span className="mr-1">View All</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              <EmergencyContact
                name="Emergency Response"
                role="Coordination Center"
                phone="555-911"
                contactId="emergency-1"
                available={true}
              />
              
              <EmergencyContact
                name="Dr. Sarah Johnson"
                role="Medical Coordinator"
                phone="555-123-7890"
                contactId="medical-1"
                available={true}
              />
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition delay={250}>
            <LocationFinder />
          </AnimatedTransition>
        </div>
      </div>
      
      {/* Emergency Contacts Dialog */}
      <EmergencyContactsDialog 
        open={showAllContacts} 
        onOpenChange={setShowAllContacts} 
      />
    </div>
  );
};

export default VictimDashboard;
