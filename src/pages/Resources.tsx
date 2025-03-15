import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import ResourceCard from '../components/ResourceCard';
import RequestForm from '../components/RequestForm';
import VictimRequestForm from '../components/VictimRequestForm';
import { PlusCircle, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AnimatedTransition from '@/components/AnimatedTransition';
import useResourceData, { Resource, ResourceType, ResourceCategory } from '@/hooks/useResourceData';
import BackButton from '@/components/BackButton';

const Resources = () => {
  const { resources, responses, addResource, loading } = useResourceData();
  const [showForm, setShowForm] = useState(false);
  const [showVictimForm, setShowVictimForm] = useState(false);
  const [filter, setFilter] = useState<'need' | 'offer' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [respondedRequestIds, setRespondedRequestIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchRespondedRequests = () => {
      if (user?.id) {
        const userResponses = JSON.parse(localStorage.getItem(`responses_${user.id}`) || '[]');
        const fastLookupResponses = JSON.parse(localStorage.getItem(`responded_requests_${user.id}`) || '[]');
        
        const combinedResponses = new Set([
          ...fastLookupResponses,
          ...userResponses.map((response: any) => response.requestId)
        ]);
        
        setRespondedRequestIds(combinedResponses);
      } else {
        setRespondedRequestIds(new Set());
      }
    };
    
    fetchRespondedRequests();
    
    const handleResponseUpdate = () => {
      fetchRespondedRequests();
    };
    
    window.addEventListener('response-created', handleResponseUpdate);
    window.addEventListener('response-updated', handleResponseUpdate);
    window.addEventListener('resource-updated', handleResponseUpdate);
    
    return () => {
      window.removeEventListener('response-created', handleResponseUpdate);
      window.removeEventListener('response-updated', handleResponseUpdate);
      window.removeEventListener('resource-updated', handleResponseUpdate);
    };
  }, [user]);
  
  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    
    fetchUser();
    
    const handleAuthChange = () => {
      fetchUser();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);
  
  const isVolunteer = user?.role === 'volunteer' || user?.role === 'ngo' || user?.role === 'government';
  
  const handleFormSubmit = (formData: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post resources",
      });
      return;
    }
    
    if (formData.type === 'need' && (user.role === 'volunteer' || user.role === 'ngo' || user.role === 'government')) {
      toast({
        title: "Action Not Available",
        description: "As a volunteer, you can only offer resources, not request them",
      });
      return;
    }
    
    if (isVolunteer) {
      formData.type = 'offer';
    }
    
    addResource({
      ...formData,
      status: 'pending'
    });
    
    setShowForm(false);
    toast({
      title: formData.type === 'need' ? "Request Posted" : "Offer Posted",
      description: "Your post has been published successfully",
    });
  };

  const handleVictimRequestSubmit = (formData: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a request",
      });
      return;
    }
    
    addResource({
      type: 'need',
      category: formData.category,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      locationDetails: formData.locationDetails,
      contact: formData.contact,
      contactName: formData.contactName,
      specialNotes: formData.specialNotes,
      urgent: formData.urgent,
      status: 'pending',
      people: formData.people,
      items: formData.items
    });
    
    setShowVictimForm(false);
    toast({
      title: "Request Submitted",
      description: "Your request has been sent to the emergency response team",
    });
  };
  
  const filteredResources = resources
    .filter(resource => filter === 'all' || resource.type === filter)
    .filter(resource => categoryFilter === 'all' || resource.category === categoryFilter)
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return b.timestamp - a.timestamp;
    });
    
  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const showRequestForm = () => {
    if (user?.role === 'victim') {
      setShowVictimForm(true);
      setShowForm(false);
    } else {
      setShowForm(true);
      setShowVictimForm(false);
    }
  };

  const getPostButtonText = () => {
    if (!user) return "New Post";
    
    if (user.role === 'victim') return "Request Help";
    
    return "Offer Resources";
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Resources" />
      
      <AnimatedTransition>
        <main className="pt-20 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              <BackButton />
            </div>
          
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">Resource Exchange</h1>
                <p className="text-gray-400">Request or offer resources in your community</p>
              </div>
              
              {!showForm && !showVictimForm && (
                <button
                  onClick={showRequestForm}
                  className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                  aria-label="Create new post"
                >
                  <PlusCircle size={18} />
                  <span>{getPostButtonText()}</span>
                </button>
              )}
            </div>
            
            {showForm ? (
              <div className="mb-8">
                <RequestForm 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setShowForm(false)}
                  userRole={user?.role} 
                />
              </div>
            ) : showVictimForm ? (
              <div className="mb-8">
                <VictimRequestForm 
                  onSubmit={handleVictimRequestSubmit} 
                  onCancel={() => setShowVictimForm(false)} 
                />
              </div>
            ) : (
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm">Filter:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filter === 'all' 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('need')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filter === 'need' 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setFilter('offer')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filter === 'offer' 
                        ? 'bg-white text-black' 
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    Offers
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as string)}
                    className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="all">All Categories</option>
                    <option value="water">Water</option>
                    <option value="shelter">Shelter</option>
                    <option value="food">Food</option>
                    <option value="supplies">Supplies</option>
                    <option value="medical">Medical</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => (
                <div key={resource.id} className="relative">
                  <div className="absolute top-3 right-3 text-xs text-gray-400">
                    {formatTimestamp(resource.timestamp)}
                  </div>
                  <ResourceCard
                    type={resource.type}
                    category={resource.category}
                    title={resource.title}
                    description={resource.description}
                    location={resource.location}
                    contact={resource.contact}
                    urgent={resource.urgent}
                    requestId={resource.id}
                    isRequested={user?.id && respondedRequestIds.has(resource.id)}
                  />
                </div>
              ))}
              
              {filteredResources.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-400">No resources match your filters.</p>
                  <button
                    onClick={() => {
                      setFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="mt-2 px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/15 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </AnimatedTransition>
    </div>
  );
};

export default Resources;
