
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { ArrowLeft, MapPin, Navigation, Compass, Route, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

const ShelterMap = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { toast } = useToast();
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  const handleNavigateToShelter = (shelter) => {
    setSelectedShelter(shelter);
    setDialogOpen(true);
    setShowRoute(false);
    
    toast({
      title: "Shelter Selected",
      description: `Selected ${shelter.name}`,
    });
  };

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            console.log("User location acquired:", position);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationPermissionDenied(true);
            toast({
              title: "Location Error",
              description: "Could not access your location. Some features may be limited.",
            });
          }
        );
      } else {
        setLocationPermissionDenied(true);
        toast({
          title: "Location Not Supported",
          description: "Your browser does not support geolocation.",
        });
      }
    };
    
    getUserLocation();
    loadDefaultMap();
  }, [toast]);

  const loadDefaultMap = () => {
    const mapIframe = document.getElementById('shelter-map');
    if (mapIframe) {
      const defaultSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBtLRkfZb_SQHkRxsLYgQWs04vT1WLKNSE&center=23.1636,79.9548&zoom=13&maptype=roadmap`;
      mapIframe.setAttribute('src', defaultSrc);
      setMapLoaded(true);
    }
  };

  const handleShowOnMap = useCallback(() => {
    if (selectedShelter) {
      const mapIframe = document.getElementById('shelter-map') as HTMLIFrameElement;
      if (mapIframe) {
        const newSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBtLRkfZb_SQHkRxsLYgQWs04vT1WLKNSE&q=${selectedShelter.coordinates.lat},${selectedShelter.coordinates.lng}&zoom=15&maptype=roadmap`;
        mapIframe.src = newSrc;
      }
      
      setDialogOpen(false);
      setShowRoute(false);
      
      toast({
        title: "Shelter Location",
        description: `Showing ${selectedShelter.name} on map`,
      });
    }
  }, [selectedShelter, toast]);

  const handleShowRoute = useCallback(() => {
    if (selectedShelter && userLocation && !locationPermissionDenied) {
      const mapIframe = document.getElementById('shelter-map') as HTMLIFrameElement;
      if (mapIframe) {
        const userLat = userLocation.lat;
        const userLng = userLocation.lng;
        const destLat = selectedShelter.coordinates.lat;
        const destLng = selectedShelter.coordinates.lng;
        
        const newSrc = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBtLRkfZb_SQHkRxsLYgQWs04vT1WLKNSE&origin=${userLat},${userLng}&destination=${destLat},${destLng}&mode=driving`;
        mapIframe.src = newSrc;
      }
      
      setDialogOpen(false);
      setShowRoute(true);
      
      toast({
        title: "Route Displayed",
        description: `Showing route to ${selectedShelter.name}`,
      });
    } else {
      toast({
        title: "Location Required",
        description: "Your location is needed to show the route. Please enable location services.",
      });
    }
  }, [selectedShelter, userLocation, locationPermissionDenied, toast]);

  const shelters = [
    {
      id: 1,
      name: "Rani Durgavati University Shelter",
      address: "Saraswati Vihar, Pachpedi, Jabalpur",
      capacity: 220,
      occupancy: 135,
      amenities: ["Food", "Water", "Medical", "Power"],
      coordinates: { lat: 23.1759, lng: 79.9821 }
    },
    {
      id: 2,
      name: "Model School Adhartal",
      address: "Adhartal, Jabalpur",
      capacity: 180,
      occupancy: 92,
      amenities: ["Food", "Water", "Power", "Pet Friendly"],
      coordinates: { lat: 23.1988, lng: 79.9409 }
    },
    {
      id: 3,
      name: "St. Aloysius College Relief Center",
      address: "Sadar, Jabalpur",
      capacity: 250,
      occupancy: 121,
      amenities: ["Food", "Water", "Medical", "Wifi"],
      coordinates: { lat: 23.1655, lng: 79.9422 }
    }
  ];
  
  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <Header title="Shelter Map" />
      
      <main className="pt-20 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <Button 
            onClick={handleGoBack}
            variant="ghost"
            className={`mb-4 flex items-center gap-1.5 text-black ${
              isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            }`}
            aria-label="Go back to dashboard"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className={`rounded-xl overflow-hidden h-[70vh] ${
                isLight ? 'bg-gray-100 border border-gray-200' : 'bg-black/20 border border-white/10'
              }`}>
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className={`animate-spin rounded-full h-10 w-10 border-t-2 ${
                        isLight ? 'border-gray-800' : 'border-white'
                      } mb-4`}></div>
                      <p className="text-black">Loading map...</p>
                    </div>
                  </div>
                )}
                <iframe 
                  id="shelter-map"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shelter Map"
                  className="w-full h-full"
                  onLoad={() => setMapLoaded(true)}
                />
                
                {userLocation && mapLoaded && (
                  <div className={`absolute bottom-4 left-4 px-3 py-2 rounded-lg text-sm ${
                    isLight ? 'bg-white/80 border border-gray-200' : 'bg-black/60 backdrop-blur-sm'
                  }`}>
                    <div className="flex items-center">
                      <MapPin size={16} className="text-black mr-2" />
                      <span className="text-black">Your location is available</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`rounded-xl p-4 h-[70vh] overflow-auto ${
              isLight ? 'bg-white border border-gray-200' : 'border border-white/10 bg-black/20'
            }`}>
              <h2 className="text-xl font-semibold mb-4 text-black">Nearby Shelters</h2>
              
              <div className="space-y-4">
                {shelters.map(shelter => (
                  <div key={shelter.id} className={`rounded-lg p-3 transition-colors ${
                    isLight 
                      ? 'border border-gray-200 bg-white hover:bg-gray-50' 
                      : 'border border-white/10 bg-black/10 hover:bg-black/30'
                  }`}>
                    <h3 className="font-medium text-black">{shelter.name}</h3>
                    <p className="text-sm mb-2 text-black">{shelter.address}</p>
                    <div className="text-xs mb-2 space-y-1 text-black">
                      <p>Capacity: {shelter.capacity} people</p>
                      <p>Status: Open ({Math.round((shelter.occupancy / shelter.capacity) * 100)}% full)</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {shelter.amenities.map(amenity => (
                          <span key={amenity} className="inline-block px-2 py-0.5 rounded-full text-black bg-gray-100">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleNavigateToShelter(shelter)}
                      size="sm" 
                      className="w-full mt-2 bg-black text-white hover:bg-black/90 rounded-2xl"
                    >
                      Navigate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">{selectedShelter?.name || 'Shelter Details'}</DialogTitle>
            <DialogDescription>
              {selectedShelter ? (
                <div className="space-y-2 mt-1">
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="mr-2 text-gray-600" />
                    <span className="text-black">{selectedShelter.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Compass size={16} className="mr-2 text-gray-600" />
                    <span className="text-black">Capacity: {selectedShelter.capacity} people</span>
                  </div>
                  <div className={`rounded-lg border p-2 mt-4 text-sm ${
                    isLight ? 'bg-gray-50' : 'bg-background/50'
                  }`}>
                    <span className="text-xs uppercase text-black font-medium">Amenities</span>
                    <div className="font-medium mt-1 flex flex-wrap gap-1">
                      {selectedShelter.amenities.map(amenity => (
                        <span key={amenity} className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-black">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : 'Loading shelter details...'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row pt-2">
            <Button 
              onClick={handleShowRoute}
              className="w-full flex items-center justify-center bg-black text-white hover:bg-black/90 rounded-2xl"
              variant="default"
              disabled={locationPermissionDenied || !userLocation}
            >
              {locationPermissionDenied || !userLocation ? (
                <Ban className="mr-2 h-4 w-4" />
              ) : (
                <Route className="mr-2 h-4 w-4" />
              )}
              Show Route
            </Button>
            <Button 
              onClick={handleShowOnMap}
              className="w-full bg-black text-white hover:bg-black/90 rounded-2xl"
              variant="secondary"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Show on Map
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="text-black">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShelterMap;
