
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import LocationFinder from '@/components/LocationFinder';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BackButton from '@/components/BackButton';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

export interface MapResource {
  id: number;
  name: string;
  type: string;
  address: string;
  distance: number;
  coordinates: { lat: number; lng: number };
}

const Map = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [selectedResource, setSelectedResource] = useState<MapResource | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const selectedLocationId = location.state?.selectedLocationId;
  
  const resources: MapResource[] = [
    {
      id: 1,
      name: "Jabalpur Medical Center",
      type: "Medical",
      address: "Wright Town, Jabalpur",
      distance: 0.8,
      coordinates: { lat: 23.1697, lng: 79.9344 }
    },
    {
      id: 2,
      name: "Ganga Water Station",
      type: "Water",
      address: "Madan Mahal, Jabalpur",
      distance: 1.2,
      coordinates: { lat: 23.1463, lng: 79.8895 }
    },
    {
      id: 3,
      name: "Food Distribution Center",
      type: "Food",
      address: "Gorabazar, Jabalpur",
      distance: 0.5,
      coordinates: { lat: 23.1821, lng: 79.9260 }
    }
  ];
  
  const navigateToLocation = (resource: MapResource) => {
    setSelectedResource(resource);
    setDrawerOpen(true);
    toast({
      title: "Location Selected",
      description: `Selected ${resource.name}`,
    });
  };

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation(position);
            setIsLoading(false);
            console.log("Location acquired:", position);
            
            if (selectedLocationId) {
              const selectedResource = resources.find(r => r.id === Number(selectedLocationId));
              if (selectedResource) {
                toast({
                  title: "Selected Location",
                  description: `Navigating to ${selectedResource.name}`,
                });
                
                navigateToLocation(selectedResource);
              }
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location Error",
              description: "Could not access your location. Please enable location services.",
            });
            setIsLoading(false);
          }
        );
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your browser does not support geolocation.",
        });
        setIsLoading(false);
      }
    };
    
    setTimeout(() => {
      getLocation();
    }, 1500);
  }, [toast, selectedLocationId, resources]);

  const getDirectionsUrl = (destination: MapResource) => {
    if (userLocation) {
      const userLat = userLocation.coords.latitude;
      const userLng = userLocation.coords.longitude;
      return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destination.coordinates.lat},${destination.coordinates.lng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${destination.coordinates.lat},${destination.coordinates.lng}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Resource Map" />
      
      <AnimatedTransition>
        <main className="pt-20 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              <BackButton />
            </div>
          
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Emergency Resources Map</h1>
              <p className="text-gray-400">Find nearby assistance and resources</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="relative rounded-xl overflow-hidden h-[70vh] border border-white/10">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white mb-4"></div>
                        <p className="text-gray-300">Loading map and resources...</p>
                      </div>
                    </div>
                  ) : (
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d117756.07676855968!2d79.94600543036132!3d23.16175785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1616661901026!5m2!1sen!2sin" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Emergency Resources Map"
                      className="w-full h-full"
                    />
                  )}
                  
                  {userLocation && !isLoading && (
                    <div className="absolute bottom-4 left-4 glass-dark px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-white/70" />
                        <span>You are here</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 glass-dark rounded-lg overflow-hidden">
                    <div className="flex">
                      <button className="p-2 hover:bg-white/10 transition-colors">
                        <MapPin size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 transition-colors">
                        <Navigation size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <LocationFinder 
                  className="h-full" 
                  mapResources={resources} 
                  onNavigate={navigateToLocation}
                />
              </div>
            </div>
          </div>
        </main>
      </AnimatedTransition>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedResource?.name || 'Resource Details'}</DrawerTitle>
            <DrawerDescription>
              {selectedResource ? (
                <div className="space-y-2 mt-1">
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>{selectedResource.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Compass size={16} className="mr-2 text-gray-400" />
                    <span>{selectedResource.distance} miles away</span>
                  </div>
                  <div className="rounded-lg border p-2 mt-4 text-sm bg-background/50">
                    <span className="text-xs uppercase text-muted-foreground font-medium">Type</span>
                    <div className="font-medium mt-1">{selectedResource.type}</div>
                  </div>
                </div>
              ) : 'Loading resource details...'}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            {selectedResource && (
              <Button 
                onClick={() => window.open(getDirectionsUrl(selectedResource), '_blank')}
                className="w-full"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Map;
