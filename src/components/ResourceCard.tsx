
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Droplet, Home, ShoppingBag, Utensils, Heart, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";

interface ResourceCardProps {
  type: 'need' | 'offer';
  category: 'water' | 'shelter' | 'food' | 'supplies' | 'medical' | 'safety';
  title: string;
  description: string;
  location: string;
  locationDetails?: string;
  contact?: string;
  contactName?: string;
  urgent?: boolean;
  className?: string;
  requestId?: string;
  isRequested?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  type,
  category,
  title,
  description,
  location,
  locationDetails,
  contact,
  contactName,
  urgent = false,
  className,
  requestId = '',
  isRequested = false,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasResponded, setHasResponded] = useState(isRequested);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAlreadyResponded, setIsAlreadyResponded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  // This effect runs whenever the component mounts or requestId changes
  useEffect(() => {
    const checkUserResponses = () => {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        setCurrentUser(user);
        
        if (requestId) {
          // Only check for responses if the current user role matches the resource type
          // Victims can request offers, volunteers/NGOs/government can respond to needs
          const shouldCheckResponses = 
            (user.role === 'victim' && type === 'offer') || 
            (['volunteer', 'ngo', 'government'].includes(user.role) && type === 'need');
          
          if (shouldCheckResponses) {
            // Load response state from localStorage
            const userResponses = JSON.parse(localStorage.getItem(`responses_${user.id}`) || '[]');
            const hasAlreadyResponded = userResponses.some((response: any) => response.requestId === requestId);
            setHasResponded(hasAlreadyResponded);
          } else {
            // If user role doesn't match resource type for interaction, they can't have responded
            setHasResponded(false);
          }
        } else {
          setHasResponded(isRequested);
        }
      }
    };
    
    // Check if this request has already been responded to by any user
    const checkGlobalResponses = () => {
      if (requestId) {
        // Check all responses in localStorage
        let anyoneResponded = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('responses_')) {
            try {
              const responses = JSON.parse(localStorage.getItem(key) || '[]');
              if (responses.some((response: any) => response.requestId === requestId)) {
                anyoneResponded = true;
                break;
              }
            } catch (error) {
              console.error('Error checking responses:', error);
            }
          }
        }
        setIsAlreadyResponded(anyoneResponded);
      }
    };
    
    checkUserResponses();
    checkGlobalResponses();
    
    // Setup event listeners to update response status when changes happen
    const handleResponseUpdate = () => {
      checkUserResponses();
      checkGlobalResponses();
    };
    
    window.addEventListener('response-created', handleResponseUpdate);
    window.addEventListener('response-updated', handleResponseUpdate);
    window.addEventListener('resource-updated', handleResourceUpdate);
    window.addEventListener('auth-changed', handleResponseUpdate);
    
    return () => {
      window.removeEventListener('response-created', handleResponseUpdate);
      window.removeEventListener('response-updated', handleResponseUpdate);
      window.removeEventListener('resource-updated', handleResourceUpdate);
      window.removeEventListener('auth-changed', handleResponseUpdate);
    };
  }, [requestId, isRequested, type]);
  
  // Update hasResponded when isRequested prop changes
  useEffect(() => {
    if (isRequested !== undefined) {
      // Only apply isRequested if user role matches resource type
      if (currentUser) {
        const isUserRoleCompatible = 
          (currentUser.role === 'victim' && type === 'offer') || 
          (['volunteer', 'ngo', 'government'].includes(currentUser.role) && type === 'need');
        
        setHasResponded(isUserRoleCompatible && isRequested);
      } else {
        setHasResponded(isRequested);
      }
    }
  }, [isRequested, currentUser, type]);
  
  // Also check storage for response status on every page navigation
  useEffect(() => {
    const syncResponseState = () => {
      if (currentUser && requestId) {
        // Only check if user role matches resource type for interaction
        const isUserRoleCompatible = 
          (currentUser.role === 'victim' && type === 'offer') || 
          (['volunteer', 'ngo', 'government'].includes(currentUser.role) && type === 'need');
        
        if (isUserRoleCompatible) {
          const userResponses = JSON.parse(localStorage.getItem(`responses_${currentUser.id}`) || '[]');
          const hasAlreadyResponded = userResponses.some((response: any) => response.requestId === requestId);
          setHasResponded(hasAlreadyResponded);
        } else {
          setHasResponded(false);
        }
      }
      
      // Also check if any user has responded to this request
      if (requestId) {
        let anyoneResponded = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('responses_')) {
            try {
              const responses = JSON.parse(localStorage.getItem(key) || '[]');
              if (responses.some((response: any) => response.requestId === requestId)) {
                anyoneResponded = true;
                break;
              }
            } catch (error) {
              console.error('Error checking responses:', error);
            }
          }
        }
        setIsAlreadyResponded(anyoneResponded);
      }
    };
    
    syncResponseState();
    
    // Listen for page navigations
    window.addEventListener('popstate', syncResponseState);
    
    return () => {
      window.removeEventListener('popstate', syncResponseState);
    };
  }, [currentUser, requestId, type]);
  
  const handleResourceUpdate = () => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      setCurrentUser(user);
      
      if (requestId) {
        // Only check for responses if the current user role matches the resource type
        const shouldCheckResponses = 
          (user.role === 'victim' && type === 'offer') || 
          (['volunteer', 'ngo', 'government'].includes(user.role) && type === 'need');
        
        if (shouldCheckResponses) {
          const userResponses = JSON.parse(localStorage.getItem(`responses_${user.id}`) || '[]');
          const hasAlreadyResponded = userResponses.some((response: any) => response.requestId === requestId);
          setHasResponded(hasAlreadyResponded);
        } else {
          setHasResponded(false);
        }
        
        // Check if this request has been responded to by any user
        let anyoneResponded = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('responses_')) {
            try {
              const responses = JSON.parse(localStorage.getItem(key) || '[]');
              if (responses.some((response: any) => response.requestId === requestId)) {
                anyoneResponded = true;
                break;
              }
            } catch (error) {
              console.error('Error checking responses:', error);
            }
          }
        }
        setIsAlreadyResponded(anyoneResponded);
      }
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'water':
        return <Droplet size={18} />;
      case 'shelter':
        return <Home size={18} />;
      case 'food':
        return <Utensils size={18} />;
      case 'supplies':
        return <ShoppingBag size={18} />;
      case 'medical':
        return <Heart size={18} />;
      case 'safety':
        return <Shield size={18} />;
      default:
        return <Droplet size={18} />;
    }
  };

  const canInteract = () => {
    if (!currentUser) return false;
    
    // If user is volunteer/ngo/government and trying to interact with a need request
    if ((currentUser.role === 'volunteer' || currentUser.role === 'ngo' || currentUser.role === 'government') && type === 'need') {
      return true; // Volunteers can help with needs
    }
    
    // If user is victim and trying to interact with an offer
    if (currentUser.role === 'victim' && type === 'offer') {
      return true; // Victims can request offers
    }
    
    // All other combinations are not allowed
    return false;
  };

  const handleRequestClick = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request or respond",
      });
      navigate('/login');
      return;
    }
    
    if (!canInteract()) {
      if ((currentUser.role === 'volunteer' || currentUser.role === 'ngo' || currentUser.role === 'government') && type === 'offer') {
        toast({
          title: "Action Not Available",
          description: "As a volunteer, you can only respond to needs, not request resources",
        });
      } else if (currentUser.role === 'victim' && type === 'need') {
        toast({
          title: "Action Not Available",
          description: "As someone affected, you can only request resources, not respond to needs",
        });
      }
      return;
    }
    
    // Check if request has already been responded to by any user
    if (isAlreadyResponded && type === 'need') {
      toast({
        title: "Already In Progress",
        description: "This request is already being addressed by another volunteer or organization",
      });
      return;
    }
    
    setIsRequesting(true);
    
    setTimeout(() => {
      setIsRequesting(false);
      setHasResponded(true);
      setIsAlreadyResponded(true);
      
      const responseId = Date.now().toString();
      const userResponses = JSON.parse(localStorage.getItem(`responses_${currentUser.id}`) || '[]');
      
      // Check if a response for this request already exists
      const existingResponseIndex = userResponses.findIndex((response: any) => response.requestId === requestId);
      
      const newResponse = {
        id: responseId,
        requestId,
        type: type === 'need' ? 'offer' : 'request',
        category,
        title,
        time: Date.now(),
        status: 'pending',
        responderName: currentUser.name || currentUser.email || 'User',
        responderRole: currentUser.role,
        responderUserId: currentUser.id
      };
      
      // Only add the response if it doesn't exist already
      if (existingResponseIndex === -1) {
        // Store in responses collection
        localStorage.setItem(`responses_${currentUser.id}`, JSON.stringify([newResponse, ...userResponses]));
        
        // Add to notifications
        const notifications = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`) || '[]');
        
        const newNotification = {
          id: Date.now().toString(),
          type: type === 'need' ? 'response' : 'request',
          title: type === 'need' ? 'You offered help' : 'You requested resource',
          message: `You have ${type === 'need' ? 'offered to help with' : 'requested'}: ${title}`,
          time: Date.now(),
          read: false,
          link: '/connect'
        };
        
        localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify([newNotification, ...notifications]));
        
        // Also store in a dedicated "responded_requests" collection to make lookups faster
        const respondedRequests = JSON.parse(localStorage.getItem(`responded_requests_${currentUser.id}`) || '[]');
        if (!respondedRequests.includes(requestId)) {
          respondedRequests.push(requestId);
          localStorage.setItem(`responded_requests_${currentUser.id}`, JSON.stringify(respondedRequests));
        }
        
        // Also update the resources list to mark this request as assigned
        if (type === 'need') {
          const storedResources = localStorage.getItem('resources');
          if (storedResources) {
            try {
              const resources = JSON.parse(storedResources);
              const updatedResources = resources.map((resource: any) => {
                if (resource.id === requestId) {
                  return {
                    ...resource,
                    status: 'addressing',
                    assignedTo: currentUser.name || currentUser.email || 'Volunteer'
                  };
                }
                return resource;
              });
              localStorage.setItem('resources', JSON.stringify(updatedResources));
            } catch (error) {
              console.error('Error updating resources:', error);
            }
          }
        }
        
        toast({
          title: type === 'need' ? "Response Sent" : "Request Sent",
          description: type === 'need' 
            ? "Your offer to help has been sent" 
            : "Your request has been submitted",
        });
        
        window.dispatchEvent(new Event('response-created'));
        window.dispatchEvent(new Event('resource-updated'));
      }
    }, 1000);
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg',
        isLight
          ? (type === 'need' 
              ? 'border border-gray-300 bg-white shadow-soft' 
              : 'border border-gray-300 bg-gray-100')
          : (type === 'need' 
              ? 'border-white/10 bg-black/40' 
              : 'border-white/5 bg-white/5'),
        urgent && (isLight ? 'ring-1 ring-gray-800' : 'ring-1 ring-white/20'),
        className
      )}
    >
      {urgent && (
        <div className={cn(
          "absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-bl-lg",
          isLight ? "bg-black text-white" : "bg-white text-black"
        )}>
          Urgent
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className={cn(
            'p-2 rounded-full mr-3',
            isLight
              ? (type === 'need' ? 'bg-gray-200' : 'bg-gray-300')
              : (type === 'need' ? 'bg-black/60' : 'bg-white/10')
          )}>
            {getCategoryIcon()}
          </div>
          <div>
            <p className={cn(
              "text-xs uppercase tracking-wider",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {type === 'need' ? 'Needed' : 'Offered'}
            </p>
            <h3 className="font-semibold text-lg mt-0.5">{title}</h3>
          </div>
        </div>
        
        <p className={cn(
          "text-sm mb-4 line-clamp-2",
          isLight ? "text-gray-700" : "text-gray-300"
        )}>{description}</p>
        
        <div className={cn(
          "text-xs mb-4",
          isLight ? "text-gray-600" : "text-gray-400"
        )}>
          <p>Location: {location}</p>
          {locationDetails && <p className="mt-1">Details: {locationDetails}</p>}
          {contact && <p className="mt-1">Contact: {contact}</p>}
          {contactName && <p className="mt-1">Contact Name: {contactName}</p>}
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowDetails(true)}
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center text-xs",
              isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
            )}
          >
            <Info size={14} className="mr-1.5" />
            <span>Details</span>
          </Button>
          
          {hasResponded ? (
            <button 
              disabled
              className={cn(
                "flex items-center text-sm font-medium py-1.5 px-3 rounded-full opacity-70 transition-colors",
                isLight ? "bg-gray-200 text-gray-600" : "bg-white/10"
              )}
            >
              <CheckCircle size={14} className="mr-1.5" />
              <span>{type === 'need' ? 'Response Sent' : 'Requested'}</span>
            </button>
          ) : isAlreadyResponded && type === 'need' ? (
            <button 
              disabled
              className={cn(
                "flex items-center text-sm font-medium py-1.5 px-3 rounded-full opacity-70 transition-colors",
                isLight ? "bg-gray-200 text-gray-600" : "bg-white/10"
              )}
            >
              <CheckCircle size={14} className="mr-1.5" />
              <span>Being Addressed</span>
            </button>
          ) : !canInteract() && currentUser ? (
            <div className={cn(
              "flex items-center text-xs",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              <AlertTriangle size={12} className="mr-1" />
              <span>
                {currentUser.role === 'victim' && type === 'need' 
                  ? 'Switch to volunteer mode to help' 
                  : 'Not available for your role'}
              </span>
            </div>
          ) : (
            <button 
              onClick={handleRequestClick}
              disabled={isRequesting}
              className={cn(
                "flex items-center text-sm font-medium py-1.5 px-3 rounded-full transition-colors focus-ring disabled:opacity-50",
                isLight
                  ? "bg-black text-white hover:bg-black/90"
                  : "bg-white/10 hover:bg-white/15"
              )}
              aria-label={type === 'need' ? 'I can help' : 'I need this'}
            >
              {isRequesting ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <span className="mr-1.5">{type === 'need' ? 'Respond' : 'Request'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className={cn(
          "sm:max-w-md",
          isLight ? "bg-white text-black" : "bg-black border border-white/10 text-white"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={cn(
                'p-1.5 rounded-full',
                isLight 
                  ? (type === 'need' ? 'bg-gray-200' : 'bg-gray-300')
                  : (type === 'need' ? 'bg-white/10' : 'bg-white/20')
              )}>
                {getCategoryIcon()}
              </div>
              <span>{title}</span>
              {urgent && (
                <span className={cn(
                  "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full",
                  isLight ? "bg-red-100 text-red-800" : "bg-red-900/30 text-red-300 border border-red-800/50"
                )}>
                  Urgent
                </span>
              )}
            </DialogTitle>
            <DialogDescription className={cn(
              "text-sm pt-2",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {type === 'need' ? 'Resource Needed' : 'Resource Offered'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className={cn(
                "text-sm font-medium mb-1",
                isLight ? "text-gray-900" : "text-gray-200"
              )}>
                Description
              </h4>
              <p className={cn(
                "text-sm",
                isLight ? "text-gray-700" : "text-gray-300"
              )}>
                {description}
              </p>
            </div>
            
            <div>
              <h4 className={cn(
                "text-sm font-medium mb-1",
                isLight ? "text-gray-900" : "text-gray-200"
              )}>
                Location
              </h4>
              <p className={cn(
                "text-sm",
                isLight ? "text-gray-700" : "text-gray-300"
              )}>
                {location}
              </p>
            </div>
            
            {locationDetails && (
              <div>
                <h4 className={cn(
                  "text-sm font-medium mb-1",
                  isLight ? "text-gray-900" : "text-gray-200"
                )}>
                  Location Details
                </h4>
                <p className={cn(
                  "text-sm",
                  isLight ? "text-gray-700" : "text-gray-300"
                )}>
                  {locationDetails}
                </p>
              </div>
            )}
            
            {contact && (
              <div>
                <h4 className={cn(
                  "text-sm font-medium mb-1",
                  isLight ? "text-gray-900" : "text-gray-200"
                )}>
                  Contact
                </h4>
                <p className={cn(
                  "text-sm",
                  isLight ? "text-gray-700" : "text-gray-300"
                )}>
                  {contact}
                </p>
              </div>
            )}
            
            {contactName && (
              <div>
                <h4 className={cn(
                  "text-sm font-medium mb-1",
                  isLight ? "text-gray-900" : "text-gray-200"
                )}>
                  Contact Name
                </h4>
                <p className={cn(
                  "text-sm",
                  isLight ? "text-gray-700" : "text-gray-300"
                )}>
                  {contactName}
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              {!hasResponded && !isAlreadyResponded && canInteract() && (
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    handleRequestClick();
                  }}
                  className={cn(
                    "flex items-center",
                    isLight
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-white/10 hover:bg-white/15"
                  )}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <span className="mr-1.5">{type === 'need' ? 'Respond' : 'Request'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              )}
              {isAlreadyResponded && type === 'need' && !hasResponded && (
                <div className="text-sm text-amber-500">
                  <AlertTriangle size={16} className="mr-1 inline-block" />
                  <span>This request is already being addressed</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceCard;
